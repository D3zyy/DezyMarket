import {  NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
import { DateTime } from "luxon";


    export async function POST(req) {
      let data,session;
      try {
 
        const data = await req.json();
    if (!data || !data.searchQuery) {
      return new Response(
        JSON.stringify({ message: "Chybějící vyhledávací dotaz." }),
        { status: 400 }
      );
    }

    const foundPosts = await prisma.$queryRaw`
  SELECT * FROM "Posts"
  WHERE to_tsvector('english', name || ' ' || description) @@ plainto_tsquery('english', ${data.searchQuery})
  ORDER BY ts_rank(to_tsvector('english', name || ' ' || description), plainto_tsquery('english', ${data.searchQuery})) DESC
  LIMIT 50;
`;

    console.log("Výsledky hledání:", foundPosts);

    return new Response(JSON.stringify({ data: foundPosts }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    


      } catch (error) {
         try{
            session = await getSession();
              const rawIp =
              req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
              req.headers.get("x-real-ip") ||                      // Alternativní hlavička
              req.socket?.remoteAddress ||                         // Lokální fallback
              null;
            
            // Odstranění případného prefixu ::ffff:
            const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
            
          
            
                  const dateAndTime = DateTime.now()
                  .setZone('Europe/Prague')
                  .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
                    await prisma.errors.create({ 
                      data:{
                      info: `Chyba na /api/search - POST - (catch) data: ${data} `,
                      dateAndTime: dateAndTime,
                      errorPrinted: error,
                      userId: session?.userId,
                      ipAddress:ip,
                      }
                    })
        
                  }catch(error){}
                  console.log(error)
        return new NextResponse(
          JSON.stringify({
            message: 'Chyba na serveru [POST] požadavek informace o předplatném'
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      } finally {
        await prisma.$disconnect(); // Uzavřete připojení po dokončení
      }
    }

