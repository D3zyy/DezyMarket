import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
import { DateTime } from "luxon"; // Pokud ještě není importováno
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  let roleId, idOfUser,session
  try {
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
    ({ roleId, idOfUser } = await request.json());
    if(session.role.privileges <= 3){
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
              info: `Chyba na /api/updateRole - POST - (Na tento příkaz nemáte oprávnění) roleId: ${roleId} idOfUser: ${idOfUser}  `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip },
            })
        return new NextResponse(
            JSON.stringify({ message: 'Na tento příkaz nemáte oprávnění' }),
            {
              status: 403,
              headers: { 'Content-Type': 'application/json' }
            }
          );
    }


    console.log("roleId:",roleId)
    console.log("idUserToEdit:",idOfUser)
    const role = await prisma.roles.findFirst({
      where: { id: roleId },
    });



    if (!role) {
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
              info: `Chyba na /api/updateRole - POST - (Role nenalezena) roleId: ${roleId} idOfUser: ${idOfUser}  `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip },
            })
      return new NextResponse(
        JSON.stringify({ message: 'Role nenalezena' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    const usr = await prisma.users.findUnique({
        where: { id: idOfUser },
        include: {
            role : true
        }
      });


    if (!usr) {

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
              info: `Chyba na /api/updateRole - POST - (Uživatel nenalezen) roleId: ${roleId} idOfUser: ${idOfUser}  `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip },
            })
        return new NextResponse(
          JSON.stringify({ message: 'Uživatel nenalezen' }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      if(session.email != 'dezy@dezy.cz'){

  
      if (usr.role.privileges >= session.role.privileges) {

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
                info: `Chyba na /api/updateRole - POST - (nemáte oprávnění na tento příkaz) roleId: ${roleId} idOfUser: ${idOfUser}  `,
                dateAndTime: dateAndTime,
                userId: session?.userId,
                ipAddress:ip },
              })
        return new NextResponse(
          JSON.stringify({ message: 'Nemáte oprávnění na tento příkaz' }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }
 await prisma.users.update({
      where: { id: idOfUser },
      data : {roleId : roleId }
    });

    await prisma.sessions.deleteMany({
        where: { userId: idOfUser },
      });

    return new NextResponse(
      JSON.stringify({ message: 'Úspěšná aktualizace role' }),
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
              info: `Chyba na /api/updateRole - POST - (catch) roleId: ${roleId} idOfUser: ${idOfUser}  `,
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