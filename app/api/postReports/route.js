import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
import { DateTime } from "luxon";
import { checkRateLimit } from "@/app/RateLimiter/rateLimit";
import { getCachedData, invalidateCache } from "@/app/getSetCachedData/caching";
export async function POST(req) {
  let data ,session
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
            console.log("Data který sem dostal na získání hlašení o příspěvků :",data)
          } catch (error) {
            return new Response(JSON.stringify({ message: "Chybně formátovaný požadavek." }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        // Ensure the session is retrieved correctly
         session = await getSession();
        if (!session || !session.isLoggedIn || !session.email) {
            return new Response(JSON.stringify({
                message: "Chyba na serveru [POST] požadavek na získání nahlašení příspěvku . Session nebyla nalezena "
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        const postExist = await prisma.Posts.findFirst({
            where: {
              id: data.postId,
            },
            include: {
              user: {
                include: {
                  role: true, // Fetches the role of the user
                },
              },
            },
          });
       
          if(!postExist){
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
                    info: `Chyba na /api/postReports - POST - (Příspěvek neexistuje)  data: ${data}  `,
                    dateAndTime: dateAndTime,            
                    userId: session?.userId,
                    ipAddress:ip },
                  })
            return new Response(JSON.stringify({
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
          }
          if(postExist.user.role.privileges >= session.role.privileges && session.role.privileges <= 3){
            
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
                      info: `Chyba na /api/postReports - POST - (Nemáte pravomoce zobrazit reporty uživatele s vetšími pravomocemi)  data: ${data}  `,
                      dateAndTime: dateAndTime,            
                      userId: session?.userId,
                      ipAddress:ip },
                    })
            return new Response(JSON.stringify({
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
          }
         
          const PostReports = await  getCachedData(`postReports_${data.postId}`, () => prisma.postReport.findMany({
    where: {
      postId: data.postId,
    },
    include: {
      user: true,
      post: true
    
    },
      }), 600)

          
          const allReportsOfPost = PostReports.map(report => ({
            fromUser: {
              id: report.user.id,
              fullName: report.user.fullName,
            },
            
            reportedAt: report.reportedAt,
            topic: report.topic, // This might be `null` if not provided.
            reason: report.reason,
          }));
         // console.log(allReportsOfPost);
   

       

 
       
          
        return new Response(JSON.stringify({
            reports: allReportsOfPost }), {
           
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
                      info: `Chyba na /api/postReports - POST - (catch)  data: ${data}  `,
                      dateAndTime: dateAndTime,
                      errorPrinted: error,
                      userId: session?.userId,
                      ipAddress:ip },
                    })
        
                  }catch(error){}
        console.error('Chyba na serveru [POST] požadavek informace o předplatném:  ', error);
        return new NextResponse(JSON.stringify({
            message: 'Chyba na serveru [POST] požadavek informace o předplatném'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }finally {
      await prisma.$disconnect(); // Uzavřete připojení po dokončení
  }
}
