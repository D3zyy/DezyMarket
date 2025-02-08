import { NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
import { DateTime } from "luxon";

export async function POST(req) {
  let data;
  try {
    // Přečteme JSON data z požadavku
    data = await req.json();

    // Ověření, že vyhledávací dotaz je dlouhý alespoň 2 znaky
    if (!data || !data.searchQuery || data.searchQuery.length < 2) {
      return new Response(
        JSON.stringify({ message: "Vyhledávací dotaz musí mít alespoň 2 znaky." }),
        { status: 400 }
      );
    }

    // Začátek měření času
    console.time("Full-text search time");
    const { keyWord, category, section, price, location } = data

  
    const filters = {
      ...(category && { category: { is: { name: category } } }),
      ...(section && { section: { is: { name: section } } }),
      ...(location && { location })
  }
    // Full-textové vyhledávání
    const foundPostsFullText = await prisma.posts.findMany({
      where: {
        ...filters,
        OR: keyWord
            ? [
                  { name: { search: `${keyWord}:*` } },
                  { description: { search: `${keyWord}:*` } }
              ]
            : undefined
    },
    });

// Pouze pokud je filtr `price` poslán, aplikujeme ho
let filteredPosts = foundPostsFullText;

if (price) {
  const isNumeric = (value) => /^\d+$/.test(value);

  filteredPosts = foundPostsFullText.filter((post) => {
    if (!isNumeric(post.price)) return false; // Odstraní nečíselné ceny

    const numericPrice = Number(post.price); // Převod na číslo

    if (price.includes("-")) {
      const [min, max] = price.split("-").map(Number);
      return numericPrice >= min && numericPrice <= max;
    } else if (price.endsWith("+")) {
      const min = Number(price.replace("+", ""));
      return numericPrice >= min;
    } else {
      return numericPrice === Number(price);
    }
  });
}

console.log("Filtered posts:", filteredPosts);


    // Konec měření času
    console.timeEnd("Full-text search time");
    const highlightText = (text, query) => {
      const regex = new RegExp(`\\b(${query}\\w*)`, "gi"); // Najde všechna slova začínající na query
      const matches = text.match(regex); // Najde odpovídající slova
    
      if (!matches) return null; // Pokud nic nenajde, vrátí null
    
      const uniqueWord = matches[0]; // Vezme první nalezené slovo
      const highlighted = `<span class="text-black dark:text-white">${query}</span><span class="font-semibold text-gray-500 dark:text-gray-400">${uniqueWord.slice(query.length)}</span>`;
    
      return { highlighted, fullWord: uniqueWord };
    };
    
    // Použití Setu pro globální odstranění duplikátů napříč všemi příspěvky
    const seenWords = new Set();
    
    const highlightedPostsFullText = filteredPosts
      .map(post => {
        const result = highlightText(post?.name, data.searchQuery);
        
        if (!result) return null; // Pokud není žádný výsledek, přeskočíme
        if (seenWords.has(result.fullWord)) return null; // Pokud už slovo existuje, přeskočíme
    
        seenWords.add(result.fullWord); // Přidáme do Setu, aby se už neopakovalo
    
        return { 
          name: result.highlighted, 
          fullWord: result.fullWord, // Přidá celé slovo
          id: post?.id, 
        };
      })
      .filter(Boolean); // Odstraní null hodnoty
    // Seřadíme nejprve podle toho, zda má příspěvek top (nebo ne), a pak podle numberOfMonthsToValid
   
    // Porovnání výsledků (můžeš vypisovat počet záznamů nebo jiné metriky)
    console.log("Počet výsledků FULLTEXT:", filteredPosts.length);

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