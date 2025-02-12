import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
import { DateTime } from 'luxon';
import { checkRateLimit } from "@/app/RateLimiter/rateLimit";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    let data,session
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


        session = await getSession();
        if (!session || !session.isLoggedIn || !session.email) {
            return new Response(JSON.stringify({
                message: "Chyba na serveru [POST] požadavek na přidání karty uživateli . Session nebyla nalezena"
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        data = await request.json();
        console.log("DATA NA SERVER pridani KARTy id payment method:",data.paymentMethodId)

        const customers = await stripe.customers.list({
            email: session.email
        });

        const customer = customers.data[0];
        async function addCardToCustomer(customerId, paymentMethodId) {
            try {
                // Připojení platební metody k zákazníkovi
                const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
                    customer: customerId,
                });
        
                // Nastavení této platební metody jako výchozí pro fakturaci
                await stripe.customers.update(customerId, {
                    invoice_settings: {
                        default_payment_method: paymentMethod.id,
                    },
                });
        
                // Můžeš také vrátit kartu nebo nějaký jiný detail o kartě
                return {
                    id: paymentMethod.id,
                    brand: paymentMethod.card.brand,
                    last4: paymentMethod.card.last4,
                    expMonth: paymentMethod.card.exp_month,
                    expYear: paymentMethod.card.exp_year,
                };
            } catch (error) {

        return new Response(JSON.stringify({    
            message: 'Úspěch karta přidána'

       }), {
           status: 403,
           headers: { 'Content-Type': 'application/json' }
       });

            }
        }
      let  cardsOfUser = await addCardToCustomer(customer.id,data.paymentMethodId)



   

        




        return new Response(JSON.stringify({    
             message: 'Úspěch karta přidána'

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
                  info: `Chyba na /api/addCard - POST - (catch) data: ${data}  `,
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
  