import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
    try {
        let data 
        try {

             data = await req.json();
          
          } catch (error) {
            return new Response(JSON.stringify({ message: "Chybně formátovaný požadavek." }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        // Ensure the session is retrieved correctly
        const session = await getSession();
        if (!session || !session.isLoggedIn || !session.email) {
            return new Response(JSON.stringify({
                message: "Chyba na serveru [POST] požadavek na deaktivaci předplatného . Session nebyla nalezena "
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Retrieve customer information from Stripe
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
        if (!subscriptions.data.length) {
            return new Response(JSON.stringify({
                message: "Žádné předplatné nenalezeno pro tohoto zákazníka"
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if(!subscriptions.data[0].cancel_at_period_end){
            return new Response(JSON.stringify({
                message: "Žádné aktivní předplatné které je pozastavené nebylo nalezeno"
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
           }
       //pokud jsou tam dvě předplatné tak udělej tohle 
       // 1. předplatné
        const subscription = subscriptions.data[0];
        const subscriptionInfo = await stripe.subscriptions.retrieve(subscription.id);
       const product = await stripe.products.retrieve(subscriptionInfo.plan.product);
       let producName =product.name;
 
       
       console.log("rovnaji se  a predplatne je nastaveno na konec: ",producName === data.name && subscriptions.data[0].cancel_at_period_end === true)
       if(producName != data.name || subscriptions.data[0].cancel_at_period_end != true){
        return new Response(JSON.stringify({
        }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
       }
       //


       
        if(producName === data.name && subscriptions.data[0].cancel_at_period_end === true){
            await stripe.subscriptions.update(
                subscription.id,
                {cancel_at_period_end: false}
              );
        }
       
          
        return new Response(JSON.stringify({
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Chyba na serveru [POST] požadavek informace o předplatném:  ', error);
        return new NextResponse(JSON.stringify({
            message: 'Chyba na serveru [POST] požadavek informace o předplatném'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
