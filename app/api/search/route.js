import { NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
import { DateTime } from "luxon";

export async function POST(req) {
  let data;
  try {
    // Přečteme JSON data z požadavku
    data = await req.json();
    if (!data || !data.searchQuery) {
      return new Response(
        JSON.stringify({ message: "Chybný nebo chybějící vyhledávací dotaz." }),
        { status: 400 }
      );
    }

    // Full-textové vyhledávání
    const foundPostsFullText = await prisma.posts.findMany({
      where: {
        OR: [
          { name: { search: `+${data.searchQuery}*` } },
          { description: { search: `+${data.searchQuery}*` } },
        ],
      },
    });

    // Pro každý příspěvek vrátíme, jaké slovo odpovídá vyhledávacímu dotazu
    const highlightedPosts = foundPostsFullText.map(post => {
      const highlightText = (text) => {
        const regex = new RegExp(data.searchQuery, "gi");
        return text.replace(regex, (match) => `<span style="font-weight: 900; color: gray;">${match}</span>`);
      };

      return {
        ...post,
        name: highlightText(post.name),
        description: highlightText(post.description),
        id: highlightText(post.id),
      };
    });

    return new Response(JSON.stringify({ data: highlightedPosts }), {
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