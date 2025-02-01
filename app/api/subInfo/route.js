import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
import { prisma } from "@/app/database/db";
import { DateTime } from "luxon";

export async function POST(request) {
    try {
        // Ensure the session is retrieved correctly
        const session = await getSession();
        if (!session || !session.isLoggedIn || !session.email) {
            return new Response(JSON.stringify({
                message: "Chyba na serveru [POST] požadavek na získání informací o předplatném. Session nebyla nalezena"
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }


        const dataFromDb = await prisma.AccountTypeUsers.findFirst({
            where: {
                active: true,
                userId: session.userId,
                accountType: {
                    priority: {
                        gt: 1,  // Ensure the related AccountType's priority is greater than 1
                    }
                }
            },
            include: {
                accountType: {  // This includes the related AccountType model
                    select: {
                        name: true,  // Select the name from the related AccountType
                    }
                },
            },
        });
        if(!dataFromDb){
            return new Response(JSON.stringify({
                message: "Nastala chyba při získávání dat z db"
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
      


        // Convert the timestamp to a date
        const date = new Date(dataFromDb.toDate);  // No need to multiply by 1000 if toDate is a valid ISO string.
        const day = date.getDate();
        const month = date.getMonth() + 1;  // Months are 0-indexed
        const year = date.getFullYear();
        
        // Format the date as day.month.year
        const formattedDate = `${day}.${month}.${year}`;
        return new Response(JSON.stringify({
            nextPayment: formattedDate,
            scheduledToCancel: dataFromDb.scheduleToCancel,
            name : dataFromDb.accountType.name
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

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
                        info: `Chyba na /api/subInfo - POST - (catch) `,
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
