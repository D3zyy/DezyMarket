import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
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

