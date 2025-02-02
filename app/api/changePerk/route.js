import {  NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
import { DateTime } from "luxon";

export async function POST(request) {
  let   perkId, newValue,accId,session
  try {

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
    ({ perkId, newValue,accId } = await request.json());
    if(session.role.privileges <= 2){

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
              info: `Chyba na /api/changePerk - POST - (Nemáte práva na tento příkaz) perkId: ${perkId} newValue: ${newValue} accId: ${accId} `,
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
              info: `Chyba na /api/changePerk - POST - (Již jste vyčerpal adm. pravomocí) perkId: ${perkId} newValue: ${newValue} accId: ${accId} `,
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


       await prisma.perksAccount.update({
            where: { id: perkId  , accId: accId},
            data:{ name: newValue}
          });
  
   


    const nowww = DateTime.now()
    .setZone('Europe/Prague')
    .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
    await prisma.managementActions.create({
      data: {
        doneAt: nowww,
        info: `Updated  perkId: ${perkId} newValue: ${newValue}`,
        fromUser: {
          connect: { id: session.userId }, // Link the user by its unique identifier
        },
      },
    });



   


    return new NextResponse(
        JSON.stringify({ message: 'Úspěšná aktualizace  perku' }),
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
              info: `Chyba na /api/changePerk - POST - (catch) perkId: ${perkId} newValue: ${newValue} accId: ${accId} `,
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