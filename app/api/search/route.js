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

    // Full-textové vyhledávání
    console.time("Full-text search time");
    const foundPostsFullText = await prisma.posts.findMany({
      where: {
        OR: [
          { name: { search: `+${data.searchQuery}*` } },
          { description: { search: `+${data.searchQuery}*` } },
        ],
      },
      select: {
        name: true,
        description: true,
        id: true,
      },
    });
    console.timeEnd("Full-text search time");

    // LIKE vyhledávání
    console.time("LIKE search time");
    const foundPostsLike = await prisma.posts.findMany({
      where: {
        OR: [
          { name: { contains: data.searchQuery } },
          { description: { contains: data.searchQuery } },
        ],
      },
      select: {
        name: true,
        description: true,
        id: true,
      },
    });
    console.timeEnd("LIKE search time");

    // Funkce pro zvýraznění výsledků
    const highlightText = (text) => {
      const regex = new RegExp(data.searchQuery, "gi");
      return text.replace(regex, (match) => `<span style="font-weight: 900; color: gray;">${match}</span>`);
    };

    // Zvýraznění textu pro full-text výsledky
    const highlightedPostsFullText = foundPostsFullText.map(post => ({
      name: highlightText(post.name),
      description: highlightText(post.description),
      id: highlightText(post.id),
    }));

    // Náhodné vybírání prvních 20 výsledků z full-textového vyhledávání
    const randomFullTextPosts = highlightedPostsFullText.sort(() => 0.5 - Math.random()).slice(0, 20);

    // Porovnání výsledků (můžeš vypisovat počet záznamů nebo jiné metriky)
    console.log("Počet výsledků FULLTEXT:", randomFullTextPosts.length);
    console.log("Počet výsledků LIKE:", foundPostsLike.length);

    return new Response(JSON.stringify({
      data: randomFullTextPosts, // Vrátí náhodně vybrané příspěvky
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