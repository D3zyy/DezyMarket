import { NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
import { DateTime } from "luxon";
import { checkRateLimit } from "@/app/RateLimiter/rateLimit";
import { getCachedData } from "@/app/getSetCachedData/caching";
export async function POST(req) {
  let data;
  try {
     const ipToRedis =
           req.headers.get("x-forwarded-for")?.split(",")[0] || 
           req.headers.get("x-real-ip") ||                     
                                                     null;
                                           
                                                   const ipCheck = ipToRedis?.startsWith("::ffff:") ? ipToRedis.replace("::ffff:", "") : ipToRedis;
                                               const rateLimitStatus = await checkRateLimit(ipCheck);
                                           
                                               if (!rateLimitStatus.allowed) {
                                                   return new Response(JSON.stringify({
                                                       message: "Příliš mnoho požadavků"
                                                   }), {
                                                       status: 403,
                                                       headers: { 'Content-Type': 'application/json' }
                                                   });
                                               }
    // Přečteme JSON data z požadavku
    data = await req.json();

    // Ověření, že vyhledávací dotaz je dlouhý alespoň 2 znaky
    if (!data || !data.keyWord || data.keyWord.length < 2) {
      return new Response(
        JSON.stringify({ message: "Vyhledávací dotaz musí mít alespoň 2 znaky." }),
        { status: 400 }
      );
    }

    // Začátek měření času
    console.time("Full-text search time");
    const { keyWord, category, section, price, location } = data;
    console.log("keyWord:",keyWord)
    console.log("Category:",category)
    console.log("Section:",section)
    console.log("Price:",price)
    console.log("Location:",location)
    // Filtry pro zbytek parametrů
    const filters = {
      ...(category && { category: { is: { name: category } } }),
      ...(section && { section: { is: { name: section } } }),
      ...(location && { location }),
      ... { visible: true  }
    };

    // Full-textové vyhledávání
    let foundPostsFullText = await getCachedData(
      `found_posts_full_text_${keyWord}`, // Unikátní klíč pro cache, který závisí na keyWord
      async () => await prisma.posts.findMany({
        where: keyWord
          ? {
              OR: [
                { name: { search: `${keyWord}:*` } },
                { description: { search: `${keyWord}:*` } },
              ],
            }
          : undefined,
      }),
      300 // Cache expirace na 5 minut (300 sekund)
    );

    console.log("KEY WORD:",keyWord)
    console.log("nasel semmmmmm:",foundPostsFullText)
    // Pouze pokud je filtr `price` poslán a není jedna z hodnot 'Dohodou', 'Vtextu' nebo 'Zdarma'
    if (price && !["Dohodou", "V textu", "Zdarma"].includes(price)) {
      const isNumeric = (value) => /^\d+$/.test(value);

      // Aplikujeme filtr na ceny až po načtení příspěvků
      foundPostsFullText = foundPostsFullText.filter((post) => {
        if (!isNumeric(post.price)) return false; // Odstraní nečíselné ceny

        const numericPrice = Number(post.price); // Převod na číslo

        if (price.includes("-")) {
          console.log(1)
          const [min, max] = price.split("-").map(Number);
          console.log("TOGLE vracím:", numericPrice >= min && numericPrice <= max)
          return numericPrice >= min && numericPrice <= max;
        } else if (price.endsWith("+")) {
          console.log(2)
          const min = Number(price.replace("+", ""));
          return numericPrice >= min;
        } else {
          console.log(3)
          return numericPrice === Number(price);
        }
      });
    } else if (price && ["Dohodou", "V textu", "Zdarma"].includes(price)) {
      // Pokud je cena jedna z hodnot 'Dohodou', 'Vtextu' nebo 'Zdarma', filtrujeme přímo v DB
      foundPostsFullText = foundPostsFullText.filter((post) => post.price === price);
    }
    console.timeEnd("Full-text search time");

    const highlightText = (text, query) => {
      const regex = new RegExp(`\\b(${query}\\p{L}*)`, "giu"); // Použití unicode pro diakritiku
      const matches = text.match(regex); // Najde odpovídající slova
    
      if (!matches) return null; // Pokud nic nenajde, vrátí null
    
      const uniqueWord = matches[0]; // Vezme první nalezené slovo
      const highlighted = `<span class="text-black dark:text-white">${query}</span><span class="font-semibold text-gray-500 dark:text-gray-400">${uniqueWord.slice(query.length)}</span>`;
    
      return { highlighted, fullWord: uniqueWord };
    };
    // Použití Setu pro globální odstranění duplikátů napříč všemi příspěvky
    const seenWords = new Set();
    
    const highlightedPostsFullText = foundPostsFullText
    .map((post) => {
      // Zvýraznění v názvu
      const nameResult = highlightText(post?.name, data.keyWord);
      // Zvýraznění v popisku
      const descriptionResult = highlightText(post?.description, data.keyWord);
  
      if (!nameResult && !descriptionResult) return null; // Pokud není žádný výsledek v názvu ani v popisku, přeskočíme
  
      // Rozhodneme, co vrátit - buď název nebo popis
      let highlightedText;
      if (nameResult) {
        highlightedText = nameResult.highlighted; // Zvýrazněný název
      } else if (descriptionResult) {
        highlightedText = descriptionResult.highlighted; // Zvýrazněný popis
      }
  
      // Uložíme celé slovo pro jednu oblast (name nebo description)
      const fullWord = nameResult ? nameResult.fullWord : descriptionResult ? descriptionResult.fullWord : null;
  
      if (seenWords.has(fullWord)) return null; // Pokud už slovo existuje, přeskočíme
  
      seenWords.add(fullWord); // Přidáme do Setu, aby se už neopakovalo
  
      return {
        name: highlightedText, // Zvýrazněný text, který buď pochází z name nebo description
        fullWord, // Přidá celé slovo
        id: post?.id,
      };
    })
    .filter(Boolean); // Odstraní null hodnoty
    
    return new Response(JSON.stringify({
      data: highlightedPostsFullText, // Vrátí seřazené příspěvky
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ message: 'Chyba na serveru.' }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}