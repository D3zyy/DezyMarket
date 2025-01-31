import { prisma } from "@/app/database/db";
import { getSession } from "@/app/authentication/actions";
import { DateTime } from "luxon";
export async function GET(req) {
  try {
    const session = await getSession();
    if (!session || !session.isLoggedIn) {
      return new Response(
        JSON.stringify({ message: 'Uživatel není přihlášen' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const allSections = await prisma.Sections.findMany();
    return new Response(
      JSON.stringify(allSections), // Make sure to JSON.stringify the data
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
          try{
               
      
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
                    info: `Chyba na /api/sections - GET - (catch)  `,
                    dateAndTime: dateAndTime,
                    errorPrinted: error,
                    userId: session?.userId,
                    ipAddress:ip,
                  })
      
                }catch(error){}
    console.error('Chyba při získávání sekcí:', error);
    return new Response(
      JSON.stringify({ message: 'Chyba na serveru při získávání sekcí' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } finally {
    await prisma.$disconnect(); // Uzavřete připojení po dokončení
  }
}