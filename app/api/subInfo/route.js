import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { custom } from "zod";
import moment from "moment";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {

    try {
   
        const session = await getSession();  
    
        if (!session.isLoggedIn)   return new Response(JSON.stringify({ message: "Chyba na serveru [POST] požadavek na  získání informací o předplatném. Session nebyla nalezena" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
       

        const customer= await stripe.customers.list({
            email: session.email
          });
          const subscriptions = await stripe.subscriptions.list({
            customer: customer.data[0].id,
          });
          const date = new Date(subscriptions.data[0].current_period_end * 1000);
          // Extract day, month, and year
          const day = date.getDate();
          const month = date.getMonth() + 1; // Months are 0-indexed
          const year = date.getFullYear();

          // Format the date as day.month.year
          const formattedDate = `${day}.${month}.${year}`;

   
            
    
            return new Response(
         
                JSON.stringify({ 
                    nextPayment: formattedDate,
                     }),
                {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
         
          



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