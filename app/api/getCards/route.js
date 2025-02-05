import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
import { DateTime } from 'luxon';

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
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
                // Získání informací o zákazníkovi
                const customer = await stripe.customers.retrieve(customerId);
                const defaultPaymMethod = customer.invoice_settings.default_payment_method;
        
                console.log('Defaultní platební metoda:', defaultPaymMethod);
        
                // Získání uložených karet
                const paymentMethods = await stripe.paymentMethods.list({
                    customer: customerId,
                    type: 'card',
                });
        
                // Vytvoření pole s informacemi o kartách + označení defaultní
                const cards = paymentMethods.data.map((method) => ({
                    id: method.id,
                    expMnth: method.card.exp_month,
                    expYr: method.card.exp_year,
                    brand: method.card.brand,
                    last4: method.card.last4,
                    isDefault: method.id === defaultPaymMethod, // Označení defaultní karty
                }));
        
          
                return cards;
            } catch (error) {
                console.error('Chyba při načítání dat o zákazníkovi:', error);
                return [];
            }
        }
      let  cardsOfUser = await getCustomerCard(customer.id)

    

        return new Response(JSON.stringify({    
            cards: cardsOfUser

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
  