import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { custom } from "zod";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {

    try {

        const session = await getSession();  
        if (!session.isLoggedIn)   return new NextResponse(
            JSON.stringify({ message: 'Chyba na serveru [POST] požadavek na subscription. Session nebyla nalezena'}),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            }
          );

   
       const { priceId , agreed} = await request.json()
  
       
        const customer= await stripe.customers.list({
            email: session.email
          });
          const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            status: "active"
        });
   
        if (subscriptions.data.length > 0) {
            return new Response(JSON.stringify({
                message: "Zákazník má již aktivní předplatné. Nelze vytvořit nové."
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
          const subscription = await stripe.subscriptions.create({
            customer:  customer.data[0].id,
            items: [{
              price: priceId.priceId,
            }],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent', 'pending_setup_intent'],
            
          });


          if (subscription.pending_setup_intent !== null) {
  
            return new NextResponse(
                JSON.stringify({ 
                     type: 'setup',
                    clientSecret: subscription.pending_setup_intent.client_secret}),
                {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
          } else {
  
    
            return new NextResponse(
         
                JSON.stringify({ 
                    type: 'payment',
                    clientSecret: subscription.latest_invoice.payment_intent.client_secret}),
                {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
         
          }



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