import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
import { DateTime } from 'luxon';
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
       session = await getSession();
    
      if (!session || !session.isLoggedIn || !session.email) {
        return new Response(JSON.stringify({
          message: "Chyba na serveru [POST] požadavek na ohodnocení uživatele. Session nebyla nalezena ",
          success: false
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      } 

       data = await req.json();
      
     
      console.log("Data  který sem dostal na ohodnocení uživatele :",data)
      
      if (data.moreInfo.length > 200) {
        return new Response(JSON.stringify({
            message: "Dodatečné inforace jsou moc dlouhé.",
            success: false
          }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
      } 
      if (data.userId == session.userId) {
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
                info: `Chyba na /api/posts/rate - POST - (Nelze ohodnotit sám sebe)  data: ${data}  `,
                dateAndTime: dateAndTime,
                userId: session?.userId,
                ipAddress:ip,}
              })
        return new Response(JSON.stringify({
            message: "Nelze ohodnotit sám sebe.",
            success: false
          }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
      } 

      if (data.numberOfStars != 5 && data.numberOfStars != 4 && data.numberOfStars != 3&& data.numberOfStars != 2 && data.numberOfStars !=1) {
       
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
                info: `Chyba na /api/posts/rate - POST - (Chybná počet hvězdiček)  data: ${data}  `,
                dateAndTime: dateAndTime,
                userId: session?.userId,
                ipAddress:ip,}
              })
        return new Response(JSON.stringify({
            message: "Chybný počet hvězdiček",
            success: false
          }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
      } 
      console.log("Uspesna kontrola hvezdicek")
   
     

      //check if given user exists

         const userExists = await     getCachedData(`userRole_${ data.userId}`, () => prisma.users.findFirst({
           where: { id:  data.userId },
           include: { role: true }
       }), 43829)
  
      if (!userExists) {
     
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
                info: `Chyba na /api/posts/rate - POST - (Uživatel na hodnocení nenalezen)  data: ${data}  `,
                dateAndTime: dateAndTime,
                userId: session?.userId,
                ipAddress:ip,}
              })
        return new Response(JSON.stringify({
          message: "Uživatel na hodnocení nenalezen",
          success: false
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
  const enoughRatingsAlread = await checkIfEnoughRatings(data.userId,session.userId)
      console.log("Může hodnotit :",enoughRatingsAlread)

    if(enoughRatingsAlread){
        return new Response(JSON.stringify({
          message: "Ohodnocení uživatele není možné. Zkuste to později",
          success: false
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
   // Získání aktuálního českého času
   const localISODateFixedOffset = DateTime.now()
   .setZone('Europe/Prague') // Čas zůstane v českém pásmu
   .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'"); // Pevně přidá offset "+00:00"

//console.log(localISODateFixedOffset); // Např. "2024-11-26T23:10:30+00:00"
  

      const newRating = await prisma.UserRatings.create({
        data: {
            ratedAt: localISODateFixedOffset,
            fromUserId: session.userId,
            toUserId: data.userId,
            extraInfo: data.moreInfo,
            numberOfStars: data.numberOfStars,
        },
    });

 await invalidateCache(`userRakings_${data.userId}`)




       
      




      return new Response(JSON.stringify({
        message: 'Uživatel byl úspěšně ohodnocen',
        success: true
      }), {
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
                info: `Chyba na /api/posts/rate - POST - (catch)  data: ${data}  `,
                dateAndTime: dateAndTime,
                errorPrinted: error,
                userId: session?.userId,
                ipAddress:ip,}
              })
  
            }catch(error){}

        console.log(error)
      return new Response(JSON.stringify({
        message: 'Chyba na serveru [POST] požadavek na hodnocení uživatele',
        success: false
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }finally {
      await prisma.$disconnect(); // Uzavřete připojení po dokončení
  }
}




async function checkIfEnoughRatings(userToRate,fromUser) {
  const currentDate = DateTime.now()
    .setZone('Europe/Prague')
    .toFormat('yyyy-MM-dd'); // Pouze datum, bez času
console.log("Dnes je :", currentDate)
  // 1. Získat počet hodnocení, která již daný uživatel poskytl tomuto uživateli ve stejný den
  const ratingsForSameUserToday = await prisma.userRatings.count({
    where: {
      fromUserId: fromUser,
      toUserId: userToRate,
      ratedAt: {
        gte: new Date(`${currentDate}T00:00:00.000Z`),
        lt: new Date(`${currentDate}T23:59:59.999Z`),
      },
    },
  });
  console.log("Hodnocení na stejného uživatele počet :",ratingsForSameUserToday)
  // Pokud už hodnotil tohoto uživatele dnes, není možné hodnotit znovu
  if (ratingsForSameUserToday > 1) {
    return true;
  }

  // 2. Získat počet všech hodnocení, která uživatel udělal během dne
  const totalRatingsToday = await prisma.userRatings.count({
    where: {
      fromUserId: fromUser,
      ratedAt: {
        gte: new Date(`${currentDate}T00:00:00.000Z`),
        lt: new Date(`${currentDate}T23:59:59.999Z`),
      },
    },
  });
  console.log("Hodnocení za dnešek celkově počet :",totalRatingsToday)
  // Pokud uživatel dnes hodnotil 3 různé uživatele, další hodnocení není možné
  if (totalRatingsToday >= 3) {
    return true;
  }

  // Uživatel může hodnotit
  return false;
}









export async function PUT(req) {
  let data
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
      const session = await getSession();
    
      if (!session || !session.isLoggedIn || !session.email) {
        return new Response(JSON.stringify({
          message: "Chyba na serveru [PUT] požadavek na zjištění zda uživatel může ohodnotit jiného uživatele:. Session nebyla nalezena ",
          success: false
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
       data = await req.json();
  
      const alreadyEnoughRating = await checkIfEnoughRatings(data.userTorate,session.userId)
      console.log("Již má dostatek hodnocení :",alreadyEnoughRating)




    





    //Pak to doupravim tady dole
      return new Response(JSON.stringify({
       reported: alreadyEnoughRating
      }), {
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
                info: `Chyba na /api/posts/rate - PUT - (catch)  data: ${data}  `,
                dateAndTime: dateAndTime,
                errorPrinted: error,
                userId: session?.userId,
                ipAddress:ip,}
              })
  
            }catch(error){}
        console.log(error)
      console.error('Chyba na serveru [PUT] požadavek na zjištění zda byl příspěvek uživatel již nahlášen: ', error);
      return new Response(JSON.stringify({
        message: 'Chyba na serveru [PUT] požadavek na zjištění zda byl příspěvek uživatel již nahlášen:',
        success: false
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }finally {
      await prisma.$disconnect(); // Uzavřete připojení po dokončení
  }
}