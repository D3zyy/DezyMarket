import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {

    try {
     const session = await getSession(); 
     if (!session.isLoggedIn)  return new NextResponse(
        JSON.stringify({ message: 'Chyba na serveru [POST] požadavek na vytvaření subscription. Session nebyla nalezena'}),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );

     const subscription = await stripe.subscriptions.create({
        customer: "cus_QloOlBO2Y2Jfby", // customer ID
        items: [{
          price: "price_1PuH84HvhgFZWc3HGd8JElE1", // price ID
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });
      if (subscription.pending_setup_intent !== null) {
        return NextResponse.json({
            type: 'setup',
          clientSecret: subscription.pending_setup_intent.client_secret,
            })
      } else {
        return NextResponse.json({
            type: 'payment',
            clientSecret: subscription.latest_invoice.payment_intent.client_secret,
            })
   
      }
   
      return NextResponse.json({ // idk what is this
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret
        })
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