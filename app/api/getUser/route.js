import {  NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
import { DateTime } from "luxon";
import { checkRateLimit } from "@/app/RateLimiter/rateLimit";
import { getCachedData } from "@/app/getSetCachedData/caching";
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
          if(!data){
            return new Response(
                JSON.stringify({ message: "Chybně formátovaný požadavek." }),
                {
                  status: 400,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
          }
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
        
         session = await getSession();
        if (!session || !session.isLoggedIn || !session.email) {
          return new Response(
            JSON.stringify({
              message: "Chyba na serveru [POST] požadavek na získání uživatelů příspěvku . Session nebyla nalezena "
            }),
            {
              status: 403,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
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
                  info: `Chyba na /api/getUser - POST - (Na tento příkaz nemáte pravomoce <=) data: ${data} `,
                  dateAndTime: dateAndTime,
                  userId: session?.userId,
                  ipAddress:ip,
                })
            return new Response(
                JSON.stringify({
                  message: "Nemáte pravomoce na tento příkaz "
                }),
                {
                  status: 403,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
        }
//, mode: 'insensitive' only on postgres


 const usersAll = await getCachedData(`searchUser_data:${data.info}`, () =>
  
  prisma.users.findMany({
    where: {
      OR: [
        { id: { contains: data.info } },
        { email: { contains: data.info } },
        { fullName: { contains: data.info } },
      ]
    },
    include: {
      role: {
        select: {
          privileges: true
        }
      }
    }
    })
    
    
    
    , 600)


    const foundUsersByIp = await getCachedData(`searchUserIp_data:${data.info}`, () =>
  
      prisma.ipAddressesOnUsers.findMany({
        where: {
          ipAddress: {
            value:{ contains: data.info }  // Query based on the 'value' field in the IpAddresses model
          }
        },
        include: {
          user: {
            include: {
              role: true  // Include the full role relation
            }
          }
        }
        })
        , 600)




 
  
  const userss = [
    ...usersAll.map(user => ({
      id: user.id,
      fullName: user.fullName,
      privileges: user.role?.privileges || null // Handle cases where role might be null
    })),
    ...foundUsersByIp.map(fu => ({
      id: fu.user.id,
      fullName: fu.user.fullName,
      privileges: fu.user.role?.privileges || null // Get privileges from the found user
    }))
  ];


          console.log("tyhle uživagtele jsem našel:",userss)

        return new Response(JSON.stringify({ users: userss }), {
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
                    await prisma.errors.create({ 
                      data:{
                      info: `Chyba na /api/getUser - POST - (catch) data: ${data} `,
                      dateAndTime: dateAndTime,
                      errorPrinted: error,
                      userId: session?.userId,
                      ipAddress:ip,
                      }
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

