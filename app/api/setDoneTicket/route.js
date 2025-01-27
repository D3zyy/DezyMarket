import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
import { DateTime } from "luxon"; // Pokud ještě není importováno
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || !session.isLoggedIn || !session.email) {
      return new NextResponse(
        JSON.stringify({ message: 'Chyba na serveru [POST] požadavek na nastavení základní typ účtu. Session nebyla nalezena' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    if(session.role.privileges <= 1){
        return new NextResponse(
            JSON.stringify({ message: 'Na tento příkaz nemáte práva' }),
            {
              status: 404,
              headers: { 'Content-Type': 'application/json' }
            }
          );
    }

    const { ticketId,type } = await request.json();
    console.log("ticketId:",ticketId)
    console.log("Typ:",type)

    if(type == 'report'){
        const foundActiveReport = await prisma.postReport.findFirst({
            where: { postId: ticketId , active: true},
          });
          if(!foundActiveReport){
            return new NextResponse(
                JSON.stringify({ message: 'Tiket nenalezen nebo již vyřešen' }),
                {
                  status: 404,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
          }
       await prisma.postReport.updateMany({
            where: { postId: ticketId , active: true},
            data:{ active: false, doneByUserId: session.userId}
          });
    }
   

   


   


    return new NextResponse(
      JSON.stringify({ message: 'Úspěšně označen ticket jako vyřešený' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
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