import {  NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
import { DateTime } from "luxon";
import { checkRateLimit } from "@/app/RateLimiter/rateLimit";
export async function POST(request) {
  let ticketId,type,session
  try {
    const ipToRedis =
     request.headers.get("x-forwarded-for")?.split(",")[0] || 
     request.headers.get("x-real-ip") ||                     
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
    if (!session || !session.isLoggedIn || !session.email) {
      return new Response(
        JSON.stringify({ message: 'Chyba na serveru [POST] požadavek na nastavení základní typ účtu. Session nebyla nalezena' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    ({ ticketId,type} = await request.json());
    if(session.role.privileges <= 1){
      const rawIp =
      request.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      request.headers.get("x-real-ip") ||                      // Alternativní hlavička
      request.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
  
    
          const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.errors.create({ data: {
              info: `Chyba na /api/setDoneTicket - POST - Na tento příkaz nemáte pravomoce) ticketId: ${ticketId} type: ${type}  `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip },
            })
        return new Response(
            JSON.stringify({ message: 'Na tento příkaz nemáte práva' }),
            {
              status: 404,
              headers: { 'Content-Type': 'application/json' }
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
      request.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      request.headers.get("x-real-ip") ||                      // Alternativní hlavička
      request.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
  
    
          const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.errors.create({ data: {
              info: `Chyba na /api/setDoneTicket - POST - (Již jste vyčerpal adm. pravomocí) ticketId: ${ticketId} type: ${type}  `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip },
            })
      return new Response(JSON.stringify({
        message: 'Již jste vyčerpal administrativních pravomocí dnes'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }



    if(type == 'report'){
        const foundActiveReport = await prisma.postReport.findFirst({
            where: { postId: ticketId , active: true},
          });
          if(!foundActiveReport){
            const rawIp =
            request.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
            request.headers.get("x-real-ip") ||                      // Alternativní hlavička
            request.socket?.remoteAddress ||                         // Lokální fallback
            null;
          
          // Odstranění případného prefixu ::ffff:
          const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
          
        
          
                const dateAndTime = DateTime.now()
                .setZone('Europe/Prague')
                .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
                  await prisma.errors.create({ data: {
                    info: `Chyba na /api/setDoneTicket - POST - (Ticket nenalezen nebo již vyřešen) ticketId: ${ticketId} type: ${type}  `,
                    dateAndTime: dateAndTime,
                    userId: session?.userId,
                    ipAddress:ip },
                  })
            return new Response(
                JSON.stringify({ message: 'Tiket nenalezen nebo již vyřešen' }),
                {
                  status: 404,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
          }
       await prisma.postReport.updateMany({
            where: { postId: ticketId , active: true},
            data:{ active: false, doneByUserId: session.userId}
          });
    } else if(type =='support'){


      const foundActiveSupport = await prisma.supportTickets.findFirst({
        where: { id: ticketId , active: true},
      });
      if(!foundActiveSupport){
              
      const rawIp =
      request.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      request.headers.get("x-real-ip") ||                      // Alternativní hlavička
      request.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
  
    
          const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.errors.create({ data: {
              info: `Chyba na /api/setDoneTicket - POST - (Ticket nenalezen nebo již vyřešen) ticketId: ${ticketId} type: ${type}  `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip },
            })
        return new Response(
            JSON.stringify({ message: 'Tiket nenalezen nebo již vyřešen' }),
            {
              status: 404,
              headers: { 'Content-Type': 'application/json' }
            }
          );
      }
   await prisma.supportTickets.updateMany({
        where: { id: ticketId , active: true},
        data:{ active: false, doneByUserrrr: session.userId}
      });
    }
   
    const nowww = DateTime.now()
    .setZone('Europe/Prague')
    .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
    await prisma.managementActions.create({
      data: {
        doneAt: nowww,
        info: `Vyřešen ticketId: ${ticketId} druh: ${type}`,
        fromUser: {
          connect: { id: session.userId }, // Link the user by its unique identifier
        },
      },
    });



   


    return new NextResponse(
        JSON.stringify({ message: 'Úspěšná aktualizace  ticketu' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );

  } catch (error) {
    try{
               
      
      const rawIp =
      request.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      request.headers.get("x-real-ip") ||                      // Alternativní hlavička
      request.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
  
    
          const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.errors.create({ data: {
              info: `Chyba na /api/setDoneTicket - POST - (catch) ticketId: ${ticketId} type: ${type}  `,
              dateAndTime: dateAndTime,
              errorPrinted: error,
              userId: session?.userId,
              ipAddress:ip },
            })

          }catch(error){}
    console.error('Chyba při vytváření požadavku na nastavení základního typu předplatného: ', error);
    return new Response(
      JSON.stringify({ message: 'Chyba na serveru [POST] požadavek na základní typ předplatného' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } finally {
    await prisma.$disconnect(); // Uzavřete připojení po dokončení
  }
}