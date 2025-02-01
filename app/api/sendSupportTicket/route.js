import {  NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
import { DateTime } from "luxon"; // Pokud ještě není importováno


export async function POST(request) {
  let  data
  let session
  try {

    session = await getSession();
    data = await request.json();
    
    const rawIp =
    request.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
    request.headers.get("x-real-ip") ||                      // Alternativní hlavička
    request.socket?.remoteAddress ||                         // Lokální fallback
    null;
  
  // Odstranění případného prefixu ::ffff:
  const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
  const ipVal = await prisma.ipAddresses.findFirst({
    where: { value: ip},
  });



    const nbrOfActTick = await prisma.supportTickets.count({
        where: { ipOfUsr: ipVal.id, active: true},
      });

      if (nbrOfActTick > 10) {
        return new NextResponse(
            JSON.stringify({ success: false }), // Include a message for more info
            {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
        const dateAndTime = DateTime.now()
        .setZone('Europe/Prague')
        .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
    const addedTicke = await prisma.supportTickets.create({
        data:{
          acceptedTermsAndPrivacyPolicy: true,
      ipOfUsr: ipVal.id, 
      active: true,
      email:data.email,
      doneAt:dateAndTime,
      text: data.text
        }
      });
    return new NextResponse(
      JSON.stringify({ success: true }),
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
            await prisma.create({ data: {
              info: `Chyba na /api/sendSupportTicket - POST - (catch) data: ${data}  `,
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