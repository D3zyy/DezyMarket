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
      status: "active",
      expand: ['data.items.data.price'], // Rozbalí objekt price pro kontrolu ID
  });
  
  console.log("předplatná:",subscriptions);
  
  // Ověření, zda existuje předplatné s konkrétní cenou
  const hasExistingSubscription = subscriptions.data.some(subscription =>
      subscription.items.data.some(item => item.price.id === "price_1QUWOUHvhgFZWc3HPMtO5Flt") // 0 CZK PRICE IN OTHER WORDS THE DEFAULT ACC
  );
  
  if (hasExistingSubscription) {
      return new Response(JSON.stringify({
          message: "Již nalezeno aktivní předplatné nelze aktivovat základní předplatné."
      }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
      });
  }
  
  // Pokračujte dál, pokud není konfliktní předplatné nalezeno
  

    const subscription = await stripe.subscriptions.create({
      customer:  customer.id,
      items: [{
        price:"price_1QUWOUHvhgFZWc3HPMtO5Flt", // free price 0 CZK
      }],
      
    });



    if (1==2) {
      return new NextResponse(
        JSON.stringify({ message: 'Základní účet již existuje pro tohoto uživatele' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

   

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