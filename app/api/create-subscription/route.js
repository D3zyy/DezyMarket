import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { custom } from "zod";
import { prisma } from "@/app/database/db";
import { DateTime } from "luxon";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
import { checkRateLimit } from "@/app/RateLimiter/rateLimit";

export async function POST(request) {
  let priceId, agreed, nameOfSub,session
  try {
                const ipToRedis =
                 request.headers.get("x-forwarded-for")?.split(",")[0] || 
                 request.headers.get("x-real-ip") ||                     
                                   null;
                         
                                 const ipCheck = ipToRedis?.startsWith("::ffff:") ? ipToRedis.replace("::ffff:", "") : ipToRedis;
                             const rateLimitStatus = await checkRateLimit(ipCheck);
                         
                             if (!rateLimitStatus.allowed) {
                                 return new Response(JSON.stringify({
                                     message: "Příliš mnoho požadavků"
                                 }), {
                                     status: 403,
                                     headers: { 'Content-Type': 'application/json' }
                                 });
                             }

      ({ priceId, agreed, nameOfSub } = await request.json());

         session = await getSession();  
        if (!session.isLoggedIn)   return new NextResponse(
            JSON.stringify({ message: 'Chyba na serveru [POST] požadavek na subscription. Session nebyla nalezena'}),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            }
          );

   
  
 
 
       const accTohaveExist = await prisma.accountType.findFirst({ // or find him where userId =session.userId
        where: { name:nameOfSub, priority: {
          gt: 1, 
        }, },
    });

    if (!accTohaveExist) {
      const rawIp =
      request.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      request.headers.get("x-real-ip") ||                      // Alternativní hlavička
      request.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
  
    
          const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.errors.create({
              data:{
              info:  `Chyba na /api/create-subscription -  POST - (Zadaný účet neexistuje) priceId: ${priceId} nameOfSub: ${nameOfSub} `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip,}
            })
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
      const rawIp =
      request.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      request.headers.get("x-real-ip") ||                      // Alternativní hlavička
      request.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
  
    
          const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.errors.create({
              data:{
              info:  `Chyba na /api/create-subscription -  POST - (Zadaný účet již máte)  priceId: ${priceId} nameOfSub: ${nameOfSub} `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip,}
            })
  





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
    const rawIp =
    request.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
    request.headers.get("x-real-ip") ||                      // Alternativní hlavička
    request.socket?.remoteAddress ||                         // Lokální fallback
    null;
  
  // Odstranění případného prefixu ::ffff:
  const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
  

  
        const dateAndTime = DateTime.now()
        .setZone('Europe/Prague')
        .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
          await prisma.errors.create({
            data:{
            info:  `Chyba na /api/create-subscription -  POST - (Zadaná cena není aktuálně platná pro tento účet)  data: priceId: ${priceId} nameOfSub: ${nameOfSub} `,
            dateAndTime: dateAndTime,
            userId: session?.userId,
            ipAddress:ip,}
          })



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

      try{
      
              
        const rawIp =
        request.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
        request.headers.get("x-real-ip") ||                      // Alternativní hlavička
        request.socket?.remoteAddress ||                         // Lokální fallback
        null;
      
      // Odstranění případného prefixu ::ffff:
      const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
      
    
      
            const dateAndTime = DateTime.now()
            .setZone('Europe/Prague')
            .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
              await prisma.errors.create({
                data:{
                info: `Chyba na /api/create-subscription - POST - (catch) priceId: ${priceId} nameOfSub: ${nameOfSub}`,
                errorPrinted: error,
                dateAndTime: dateAndTime,
                userId: session?.userId,
                ipAddress:ip,}
              })
            } catch(error){
      
            }



      console.error('Chyba při vytvřání požadavku na platbu : ', error);
      return new NextResponse(
        JSON.stringify({ message: 'Chyba na serveru [POST] požadavek na platbu'}),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }finally {
      await prisma.$disconnect(); // Uzavřete připojení po dokončení
  }
  }