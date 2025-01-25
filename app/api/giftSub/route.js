import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
import { getUserAccountTypeOnStripe } from "@/app/typeOfAccount/Methods";
const { DateTime } = require('luxon');


    export async function POST(req) {
      try {
        let data;
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
        const session = await getSession();
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
        let thisUserToGIft = await prisma.users.findUnique({where: {id: data.idOfUser}})
        console.log("TOgle je ten user:",thisUserToGIft)
      let  currentSub = await getUserAccountTypeOnStripe(thisUserToGIft.email)
      console.log("Tohle má teďka :",currentSub)
      if(currentSub?.priority > 1 && currentSub?.priority != null){
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
      return new Response(JSON.stringify({
        message: 'Již jste vyčerpal administrativních pravomocí dnes'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
          if(session.email != 'dezy@dezy.cz') {
        if (session.role.privileges <= 2 || data.idOfUser == session.userId) {
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

