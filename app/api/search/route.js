import { NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
import { DateTime } from "luxon";

export async function POST(req) {
  let data, session;
  try {
    // Přečteme JSON data z požadavku
    data = await req.json();
    if (!data || !data.searchQuery) {
      return new Response(
        JSON.stringify({ message: "Chybný nebo chybějící vyhledávací dotaz." }),
        { status: 400 }
      );
    }

    console.log("Hledám:", data.searchQuery);

    // Měření času pro full-textové vyhledávání
    console.time('fullTextSearchTime'); // Začínáme měření
    const foundPostsFullText = await prisma.posts.findMany({
     
      where: {
        name: {
          search: `${data.searchQuery}*`,
        },
        description: {
          search: `${data.searchQuery}*`,
        },
      },
    });
    console.timeEnd('fullTextSearchTime'); // Konec měření

    // Měření času pro LIKE vyhledávání
    const likeSearchTimeLabel = 'likeSearchTime_' + Date.now(); // unikátní label pro LIKE
    console.time(likeSearchTimeLabel); // Začínáme měření
    const foundPostsLike = await prisma.posts.findMany({
      where: {
        OR: [
          {
            name: {
              contains: data.searchQuery, // LIKE equivalent pro název
            },
          },
          {
            description: {
              contains: data.searchQuery, // LIKE equivalent pro popis
            },
          },
        ],
      },
    });
    console.timeEnd(likeSearchTimeLabel); // Konec měření pro LIKE

    // Výpis výsledků a časů
    console.log("=============================================");
    console.log("Výsledky full-textového vyhledávání:");
    console.log(`Počet nalezených příspěvků: ${foundPostsFullText.length}`);
    console.log("=============================================");
    console.log("Výsledky LIKE vyhledávání:");
    console.log(`Počet nalezených příspěvků: ${foundPostsLike.length}`);
    console.log("=============================================");

    return new Response(JSON.stringify({ 
      dataFullText: foundPostsFullText, 
      dataLike: foundPostsLike 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    try {
      session = await getSession();
      const rawIp =
        req.headers.get("x-forwarded-for")?.split(",")[0] || 
        req.headers.get("x-real-ip") || 
        req.socket?.remoteAddress || 
        null;

      const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;

      const dateAndTime = DateTime.now()
        .setZone('Europe/Prague')
        .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");

      await prisma.errors.create({
        data: {
          info: `Chyba na /api/search - POST - (catch) data: ${data} `,
          dateAndTime: dateAndTime,
          errorPrinted: error,
          userId: session?.userId,
          ipAddress: ip,
        },
      });
    } catch (error) {}
    console.log(error);
    return new NextResponse(
      JSON.stringify({
        message: 'Chyba na serveru [POST] požadavek informace o předplatném',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } finally {
    await prisma.$disconnect(); // Uzavřete připojení po dokončení
  }
}