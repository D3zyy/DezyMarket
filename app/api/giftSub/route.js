import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
import { getUserAccountTypeOnStripe } from "@/app/typeOfAccount/Methods";
import { checkRateLimit } from "@/app/RateLimiter/rateLimit";
import { getCachedData, invalidateCache } from "@/app/getSetCachedData/caching";
const { DateTime } = require('luxon');


    export async function POST(req) {
      let data,session;
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
        try {
          data = await req.json();
          console.log("Data který sem dostal na gift subuuuu :", data);
        } catch (error) {
          return new Response(
            JSON.stringify({ message: "Chybně formátovaný požadavek." }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
        if(data.nmbMontIn < 1 || data.NumberMont < 1){
            return new Response(
                JSON.stringify({ message: "Chybně formátovaný požadavek." }),
                {
                  status: 400,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
        }
        // Ensure the session is retrieved correctly
         session = await getSession();
        if (!session || !session.isLoggedIn || !session.email) {
          return new Response(
            JSON.stringify({
              message: "Chyba na serveru [POST] požadavek na získání nahlašení příspěvku . Session nebyla nalezena "
            }),
            {
              status: 403,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }

 const thisUserToGIft = await     getCachedData(`userRole_${data.idOfUser}`, () => prisma.users.findUnique({
        where: {id: data.idOfUser},
        include: { role: true }
    }), 43829)

    



      let  currentSub = await getUserAccountTypeOnStripe(thisUserToGIft.email)
      console.log("Tohle má teďka :",currentSub)
      if(currentSub?.priority > 1 && currentSub?.priority != null){
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
                info: `Chyba na /api/giftSub - POST - (Tento uživatel již má aktivní předplatné) data: ${data} `,
                dateAndTime: dateAndTime,
                userId: session?.userId,
                ipAddress:ip },
              })
        return new Response(JSON.stringify({
          message: 'Tento uživatel již má aktivní předplatné'
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
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
            await prisma.errors.create({ data: {
              info: `Chyba na /api/giftSub - POST - (Již jste vyčerpa admn. pravomocí) data: ${data} `,
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
          if(session.email != 'dezy@dezy.cz') {
        if (session.role.privileges <= 2 || data.idOfUser == session.userId) {
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
                  info: `Chyba na /api/giftSub - POST - (na tento příkaz nemáte oprvánění) data: ${data} `,
                  dateAndTime: dateAndTime,
                  userId: session?.userId,
                  ipAddress:ip },
                })
          return new Response(
            JSON.stringify({
              message: "Na tento příkaz nemáte oprávnění.",
            }),
            {
              status: 403,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      }
        const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
    
        // Přičítání měsíců k datu
        const nextPaymentDate = DateTime.fromISO(dateAndTime).plus({ months: data.NumberMont }).toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
        const toDate = DateTime.fromISO(dateAndTime).plus({ months: data.NumberMont }).toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
    
        await prisma.AccountTypeUsers.create({
          data: {
            gifted: true,
            monthIn: data.nmbMontIn,
            active: true,
            scheduleToCancel: true,
            nextPayment: nextPaymentDate,  // Nastavení příští platby
            fromDate: dateAndTime,
            toDate: toDate,
            user: { connect: { id: data.idOfUser } },
            accountType: { connect: { id: data.idOfSub } },
          },
        });
        

 let userGifteeedd= await getCachedData(`userRole_${data.idOfUser }`, () => prisma.users.findUnique({
      where: { id:data.idOfUser },
      include: { role: true }
  }),43829)
   
        await invalidateCache(`userRole_${data.idOfUser}`)
        await invalidateCache(`userAcc_${userGifteeedd.email}`)

       let gi= await prisma.accountType.findUnique({
          where: {id: data.idOfSub}
        });
        const nowww = DateTime.now()
        .setZone('Europe/Prague')
        .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
        await prisma.managementActions.create({
          data: {
            fromUserId: session.userId,
            doneAt: 
              nowww,
            
            toUserId: data.idOfUser,
            info: `Gift sub ${gi.name} na ${data.NumberMont} měsíců od měsíce : ${data.nmbMontIn}`
          },
        });
        return new Response(JSON.stringify({ message: "Předplatné bylo úspěšně nastaveno." }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
    
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
                  info: `Chyba na /api/giftSub - POST - (catch) data: ${data} `,
                  dateAndTime: dateAndTime,
                  errorPrinted: error,
                  userId: session?.userId,
                  ipAddress:ip },
                })
    
              }catch(error){}


        console.error('Chyba na serveru [POST] požadavek informace o předplatném:  ', error);
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

