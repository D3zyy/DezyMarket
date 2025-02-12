import { prisma } from "@/app/database/db";
import { getSession } from "@/app/authentication/actions";
import { DateTime } from "luxon";
import { checkRateLimit } from "@/app/RateLimiter/rateLimit";
import { getCachedData,invalidateCache } from "@/app/getSetCachedData/caching";
export async function POST(req) {
  let data,session
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
     session = await getSession();
    if (!session || !session.isLoggedIn) {
      return new Response(
        JSON.stringify({ message: 'Uživatel není přihlášen' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    data = await req.json();
   if(session.role.privileges <= 1){
  
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
          await prisma.errors.create({ data: {
            info: `Chyba na /api/revisiblePost - POST - (Na tento příkaz nemáte pravomoce)  data: ${data}  `,
            dateAndTime: dateAndTime,
            userId: session?.userId,
            ipAddress:ip },
          })
    return new Response(
        JSON.stringify({ message: 'Na tento příkaz nemáte oprávnění' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
   }


   await prisma.posts.update({
    where: {
        id: data.postId
    },
    data: {
        visible: true
    }
});
await invalidateCache(`post_record_${data.postId}`)
    return new Response(
        JSON.stringify({ message: 'Úspěch' }),
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
                  await prisma.errors.create({ data: {
                    info: `Chyba na /api/revisiblePost - POST - (catch)  data: ${data}  `,
                    dateAndTime: dateAndTime,
                    errorPrinted: error,
                    userId: session?.userId,
                    ipAddress:ip },
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