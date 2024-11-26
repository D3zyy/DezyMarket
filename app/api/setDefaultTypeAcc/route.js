import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return new NextResponse(
        JSON.stringify({ message: 'Chyba na serveru [POST] požadavek na nastavení zakladní typ účtu. Session nebyla nalezena' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }


    const customers = await stripe.customers.list({
      email: session.email
    });

    if (!customers.data.length) {
      return new Response(JSON.stringify({
        message: "Žádný zákazník nenalezen s tímto emailem"
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const customer = customers.data[0];
    
    // Retrieve subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "active"
    });

    if (subscriptions.data.length) {
      return new Response(JSON.stringify({
        message: "Již nalezeno aktivní předplatné nelze aktivovat základní předplatné."
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let isAlreadyAcc = await prisma.AccountType.findFirst({
      where: {
        name: "zakladni",
        userId: session.userId,
      },
    });

    console.log("Již existuje :", isAlreadyAcc);
    if (isAlreadyAcc) {
      return new NextResponse(
        JSON.stringify({ message: 'Základní účet již existuje pro tohoto uživatele' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    await prisma.AccountType.create({
      data: {
        name: "zakladni",
        userId: session.userId,
      },
    });

    return new NextResponse(
      JSON.stringify({ message: 'Uspesne aktivován základní typ učtu' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Chyba při vytvřání požadavku na nastavení základního typu předplatného : ', error);
    return new NextResponse(
      JSON.stringify({ message: 'Chyba na serveru [POST] požadavek na zakladní typ předplatného' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } finally {
    await prisma.$disconnect(); // Uzavřete připojení po dokončení
  }
}