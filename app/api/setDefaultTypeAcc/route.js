import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
import { DateTime } from "luxon"; // Pokud ještě není importováno
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
import { checkRateLimit } from "@/app/RateLimiter/rateLimit";
import { getCachedData, invalidateCache } from "@/app/getSetCachedData/caching";
export async function POST(request) {
  let name,session
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
      return new NextResponse(
        JSON.stringify({ message: 'Chyba na serveru [POST] požadavek na nastavení základní typ účtu. Session nebyla nalezena' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    ({ name} = await request.json());

 const user = await getCachedData(`userEmail_${session.email}`, () => prisma.users.findFirst({
    where: { email: session.email }
    }), 43829)
    await invalidateCache(`userAcc_${session.email}`)
    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: 'Uživatel nenalezen' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }



    // Najdi AccountType podle názvu
    const accountType = await prisma.AccountType.findFirst({
      where: { name: name },
    });

    if (!accountType) {
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
              info: `Chyba na /api/setDefaultTypeAcc - POST - (Typ účtu nenalezen) name: ${name}  `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip },
            })
      return new NextResponse(
        JSON.stringify({ message: 'Typ účtu nenalezen' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Zkontroluj, zda uživatel již má tento typ účtu
    const existingAccountTypeUser = await prisma.AccountTypeUsers.findFirst({
      where: {
        userId: user.id,
        accountTypeId: accountType.id,
        active: true,
      },
    });

    if (existingAccountTypeUser) {
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
              info: `Chyba na /api/setDefaultTypeAcc - POST - (Uživatel již má aktivní základní typ účtu) name: ${name}  `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip },
            })

      return new NextResponse(
        JSON.stringify({ message: 'Uživatel již má aktivní základní typ účtu' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const fromDate = DateTime.now()
      .setZone('Europe/Prague')
      .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");

    // Vytvoř nový záznam
    await prisma.AccountTypeUsers.create({
      data: {
        active: true,
        fromDate: fromDate,
        user: { connect: { id: user.id } },
        accountType: { connect: { id: accountType.id } },
        monthIn: 0
      },
    });

    return new NextResponse(
      JSON.stringify({ message: 'Úspěšně aktivován základní typ účtu' }),
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
              info: `Chyba na /api/setDefaultTypeAcc - POST - (catch) name: ${name}  `,
              dateAndTime: dateAndTime,
              errorPrinted: error,
              userId: session?.userId,
              ipAddress:ip },
            })

          }catch(error){}
    console.error('Chyba při vytváření požadavku na nastavení základního typu předplatného: ', error);
    return new NextResponse(
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