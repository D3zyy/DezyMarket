import { NextRequest, NextResponse } from "next/server";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {

    try {
     const { amount } = await request.json()
     const paymentIntent = await stripe.paymentIntents.create({
        amount : amount *10000,
        currency: "czk",
        automatic_payment_methods : { enabled: true}
     })
   
      return NextResponse.json({clientSecret : paymentIntent.client_secret})
    } catch (error) {

      console.error('Chyba při vytvřání požadavku na platbu : ', error);
      return new NextResponse(
        JSON.stringify({ message: 'Chyba na serveru [POST] požadavek na platbu'}),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }