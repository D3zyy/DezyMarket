import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { custom } from "zod";
import { prisma } from "@/app/database/db";
import { DateTime } from "luxon";
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

   
       const { priceId , agreed, nameOfSub} = await request.json()
 
 
       const accTohaveExist = await prisma.accountType.findFirst({ // or find him where userId =session.userId
        where: { name:nameOfSub, priority: {
          gt: 1, 
        }, },
    });

    if (!accTohaveExist) {
      return new NextResponse(
        JSON.stringify({ message: 'Účet který byl poslán že chcete neexistuje' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const existWithuser = await prisma.AccountTypeUsers.findFirst({
      where: {
          active: true,
          userId: session.userId,
          accountType: {
              id : accTohaveExist.id  , 
               priority: {
                gt: 1, 
              },
          }
      },
    });


    if (existWithuser) {
      return new NextResponse(
        JSON.stringify({ message: 'Účet který byl poslán že chcete již máte.' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
      

    const dateAndTime = DateTime.now()
    .setZone('Europe/Prague')
    .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
  
  // Hledání aktuálně platné ceny podle priceCode
  const priceToBuy = await prisma.accountTypeOnPrices.findFirst({
    where: {
      id: accTohaveExist.id,
      activeFrom: {
        lte: dateAndTime, // Musí být platné od minulosti nebo teď
      },
      OR: [
        {
          activeTo: null, // Platí do neurčita
        },
        {
          activeTo: {
            gte: dateAndTime, // Musí být stále platné (budoucnost nebo teď)
          },
        },
      ],
      price: {
        priceCode: priceId, // Podmínka na propojený priceCode z tabulky prices
      },
    },
    include: {
      price: true, // Zahrnutí detailů ceny
    },
  });

  if (!priceToBuy) {
    return new NextResponse(
      JSON.stringify({ message: 'Zadaná cena není aktuálně platná pro tento účet.' }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }



       const customer = await stripe.customers.search({
        query: `email:'${session.email}'`,
      });
      
        
        
       
        let priceee =priceId
          const subscription = await stripe.subscriptions.create({
            customer:  customer.data[0].id,
            items: [{
              price: priceId,
             
            }],  metadata: {
              name: nameOfSub, priceId: priceee
            },
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