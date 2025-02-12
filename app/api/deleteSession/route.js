import { prisma } from "@/app/database/db";
import { getSession } from "@/app/authentication/actions";
import { DateTime } from "luxon";
import { checkRateLimit } from "@/app/RateLimiter/rateLimit";
import { invalidateCache } from "@/app/getSetCachedData/caching";
export async function POST(req) {
  let data
  let userToBreak,session

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
        JSON.stringify({ message: "Uživatel není přihlášen" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const data = await req.json();
    userToBreak = await prisma.sessions.findFirst({
      where: { id: data.sessionId },
      include: { user: { include : {role:true}} },
    });
    console.log("tenhle:",userToBreak)
    console.log("DATA:",data)
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
            await prisma.errors.create({
              data:{ 
              info: `Chyba na /api/deleteSession - POST - (Na tento příkaz nemáte oprávnění) userIdToBreak: ${userToBreak.user.id} `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip,}
            })
        return new Response(
            JSON.stringify({ message: "Na tento příkaz nemáte oprávnění" }),
            {
              status: 403,
              headers: { "Content-Type": "application/json" },
            }
          );
    }

     const currentDate = DateTime.now()
        .setZone('Europe/Prague')
        .toFormat('yyyy-MM-dd');
        let numberOfActionsToday = await prisma.managementActions.count({
          where: {
            fromUserId: session.userId,
            doneAt: {
              gte: new Date(`${currentDate}T00:00:00.000Z`),
              lt: new Date(`${currentDate}T23:59:59.999Z`),
            },
          },
        });
      
        if(session.role.privileges  === 2 && numberOfActionsToday > 100 || session.role.privileges  === 3 && numberOfActionsToday > 200 ){
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
                  info: `Chyba na /api/deleteSession - POST - (Již jste vyčerpal adm. pravomocí): userIdToBreak: ${userToBreak.user.id} `,
                  dateAndTime: dateAndTime,
                  userId: session?.userId,
                  ipAddress:ip,}
                })
          return new Response(JSON.stringify({
            message: 'Již jste vyčerpal administrativních pravomocí dnes'
          }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
        }



    if (!data.sessionId) {
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
              info: `Chyba na /api/deleteSession - POST - (sessionId nebyla poskytnuta) userIdToBreak: ${userToBreak.user.id} `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip,}
            })
      return new Response(
        JSON.stringify({ message: "sessionId není poskytován" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }



    if(userToBreak.user.role.privileges >= session.role.privileges){
      
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
                info: `Chyba na /api/deleteSession - POST - (Uživatel na zničení session má vetší pravomoce než níčitel) userToBreak: ${userToBreak.user.id} `,
                dateAndTime: dateAndTime,
                userId: session?.userId,
                ipAddress:ip,}
              })
  
           

      return new Response(
        JSON.stringify({ message: "Na tento příkaz nemáte oprávnění" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    await invalidateCache(`session_record_${data.sessionId}`)
    await prisma.sessions.delete({
      where: { id: data.sessionId },
    });

    const nowww = DateTime.now()
    .setZone('Europe/Prague')
    .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
    await prisma.managementActions.create({
      data: {
        doneAt: nowww,
        info: `Zničení session`,
        fromUser: {
          connect: { id: session.userId }, // Link the user by its unique identifier
        },
        toUser : {
          connect : { id: userToBreak.user.id}
        }

      },
    });
   console.log("vyřešeno")
    return new Response(
      JSON.stringify({ message: "Session byla úspěšně smazána" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
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
              data:{ 
              info: `Chyba na /api/deleteSession - POST - (catch)  userIdToBreak: ${userToBreak.user.id} `,
              dateAndTime: dateAndTime,
              errorPrinted: error,
              userId: session?.userId,
              ipAddress:ip}
            })

          }catch(error){}




    console.error("Chyba při mazání session:", error);
    return new Response(
      JSON.stringify({ message: "Chyba na serveru při mazání session" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await prisma.$disconnect(); // Uzavřete připojení po dokončení
  }
}