import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
import { DateTime } from 'luxon';

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function DELETE(request) {
    let data,session
    try {

        session = await getSession();
        if (!session || !session.isLoggedIn || !session.email) {
            return new Response(JSON.stringify({
                message: "Chyba na serveru [POST] požadavek na získání karet uživatele . Session nebyla nalezena"
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        data = await request.json();
       
        const customers = await stripe.customers.list({
            email: session.email
        });

        const customer = customers.data[0];
        async function getCustomerCard(customerId) {
            try {
        
                // Získání uložených karet
                const paymentMethods = await stripe.paymentMethods.list({
                    customer: customerId,
                    type: 'card',
                });
               // console.log(JSON.stringify(paymentMethods, null, 2));
                // Vytvoření pole obsahujícího požadované informace
                const cards = paymentMethods.data.map((method) => ({
                    id: method.id,
                    expMnth: method.card.exp_month,
                    expYr: method.card.exp_year,
                    brand: method.card.brand,
                    last4: method.card.last4,
                }));
                
      
                return cards
            } catch (error) {
                console.error('Chyba při načítání dat o zákazníkovi:', error);
            }
        }
      let  cardsOfUser = await getCustomerCard(customer.id)



        const exists = cardsOfUser.some(card => card.id === data.cardId);

        console.log("Je to jeho:",exists); 
        if(!exists){
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
                  await prisma.errors.create({ data: {
                    info: `Chyba na /api/deleteCard - DELETE - (Karta neptaří uživateli) data: ${data.cardId}  `,
                    dateAndTime: dateAndTime,
                    userId: session?.userId,
                    ipAddress:ip },
                  })
      
            return new NextResponse(JSON.stringify({
            message: 'Tato karta nepatří uživateli'
        }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
            
            
        }
            if(!data.setDef){
                const deletedPaymentMethod = await stripe.paymentMethods.detach(data.cardId);
            } else if(data.setDef){
                await stripe.customers.update(customer.id, {
                    invoice_settings: {
                        default_payment_method: data.cardId,
                    },
                });
            }






        return new Response(JSON.stringify({    
             message: 'Úspěch'

        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

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
                await prisma.errors.create({ data: {
                  info: `Chyba na /api/subInfo/upgrade - POST - (catch) data: ${data}  `,
                  dateAndTime: dateAndTime,
                  errorPrinted: error,
                  userId: session?.userId,
                  ipAddress:ip },
                })
    
              }catch(error){}
          console.error('Chyba na serveru [POST] požadavek informace o předplatném:  ', error);
          return new NextResponse(JSON.stringify({
              message: 'Chyba na serveru [POST] požadavek informace o předplatném'
          }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
          });
      }finally {
        await prisma.$disconnect(); // Uzavřete připojení po dokončení
  }
  }
  