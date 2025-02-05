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

    // Full-textové vyhledávání
    const foundPostsFullText = await prisma.posts.findMany({
      where: {
        OR: [
          { name: { search: `+${data.searchQuery}*` } },
          { description: { search: `+${data.searchQuery}*` } },
        ],
      },
      include: {
        top: true,
       
      }
    });

    // Konec měření času
    console.timeEnd("Full-text search time");

    // Funkce pro zvýraznění výsledků
    const highlightText = (text) => {
      const regex = new RegExp(data.searchQuery, "gi");
      return text.replace(regex, (match) => `<span style="font-weight: 600; color: gray;">${match}</span>`);
    };

    // Zvýraznění textu pro full-text výsledky
    const highlightedPostsFullText = foundPostsFullText.map(post => ({
      name: highlightText(post?.name),
      description: highlightText(post?.description),
      id: highlightText(post?.id),
      top: post?.top,
      numberOfMonthsToValid: post?.top?.numberOfMonthsToValid
    }));

    // Seřadíme nejprve podle toho, zda má příspěvek top (nebo ne), a pak podle numberOfMonthsToValid
    const sortedPosts = highlightedPostsFullText
      .sort((a, b) => {
        return b.numberOfMonthsToValid - a.numberOfMonthsToValid; // Pokud oba mají stejný top, seřadíme podle numberOfMonthsToValid
      })
      .slice(0, 20);  // Vezmeme prvních 20 výsledků

    // Porovnání výsledků (můžeš vypisovat počet záznamů nebo jiné metriky)
    console.log("Počet výsledků FULLTEXT:", sortedPosts.length);

    return new Response(JSON.stringify({
      data: sortedPosts, // Vrátí seřazené příspěvky
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