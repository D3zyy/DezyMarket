import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/database/db";
import { DateTime } from 'luxon';

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const sig = request.headers.get('stripe-signature');
    let event;

    try {
        const rawBody = await request.text();

        // Ověření podpisu Stripe webhooku
        event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);

        // Zpracování webhook událostí
        if (event.type === 'invoice.payment_succeeded') {
            const paymentIntent = event.data.object;
            console.log("PaymentIntent:",paymentIntent)

            // Získání emailu a subscription ID z PaymentIntent
            const userEmail = paymentIntent.customer_email; // Email uživatele
            const subscriptionId = paymentIntent.subscription; // Subscription ID
        
           // const productName = paymentIntent.subscription_details.metada.name;
            if (!userEmail || !subscriptionId) {
                throw new Error("Chybí důležité informace v PaymentIntent: email nebo subscriptionId.");
            }

            console.log(`Zpracování platby pro uživatele: ${userEmail}`);

            // Načtení detailů předplatného z API Stripe
          
           

                // Konkrétní data o předplatném
                const currentPeriodStart = paymentIntent.period_start; // Unix timestamp (v sekundách)
                const currentPeriodEnd = paymentIntent.period_end; // Unix timestamp (v sekundách)
              
                
                console.log('Current Period Start:', currentPeriodStart);
                console.log('Current Period End:', currentPeriodEnd);
                
                // Převod na JavaScript Date (v milisekundách)
                const startDate = new Date(currentPeriodStart * 1000); 
                const endDate = new Date(currentPeriodEnd * 1000); 
                
                // Kontrola, zda jsou data platná
                if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                  console.log('Invalid Date');
                } else {
                  console.log('Current Period Start Date:', startDate);
                  console.log('Current Period End Date:', endDate);
                }
            

                const accToAcctivate = await prisma.AccountType.findFirst({
                    where: {
                        name: paymentIntent.subscription_details.metadata.name,  // Hledání podle emailu
                    },
                });
                console.log("Id typu uctu:",accToAcctivate.id)
                // Načtení uživatele z databáze pomocí emailu
                const user = await prisma.Users.findFirst({
                    where: {
                        email: userEmail,  // Hledání podle emailu
                    },
                });

                if (!user) {
                    throw new Error(`Uživatel s e-mailem ${userEmail} nebyl nalezen.`);
                }
                const fromDate = DateTime.now()
                .setZone('Europe/Prague') // Čas zůstane v českém pásmu
                .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");

              
              
              const toDate = DateTime.now()
              .setZone('Europe/Prague') // Čas zůstane v českém pásmu
              .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
                console.log("Duvod:",paymentIntent.billing_reason)
              if (paymentIntent.billing_reason === "subscription_create") {
                await prisma.AccountTypeUsers.create({
                  data: {
                    scheduleToCancel: false,
                    nextPayment: String(currentPeriodEnd),  // Použití timestampu jako čísla
                    fromDate: fromDate,  // Použití formátovaného data z luxon
                    toDate: toDate,      // Použití formátovaného data z luxon
                    user: {
                      connect: {
                        id: user.id, // Připojení uživatele pomocí jeho ID
                      },
                    },
                    accountType: {
                      connect: {
                        id: accToAcctivate.id, // Připojení typu účtu pomocí jeho ID
                      },
                    },
                  },
                });
              } else if (paymentIntent.billing_reason === "subscription_cycle") {
                const updatedToDate = DateTime.fromISO(toDate)
                  .plus({ months: 1 }) // Přidání jednoho měsíce k původnímu datu
                  .toISO();
              
                await prisma.AccountTypeUsers.update({
                  where: {
                    userId: cancelAtPeriodEnd,
                    scheduleToCancel: false,
                    monthIn: monthIn + 1,
                  },
                  data: {
                    fromDate: fromDate,  // Použití formátovaného data z luxon
                    toDate: updatedToDate, // Nové datum po přidání měsíce
                  },
                });
              }
                    

                console.log(`Předplatné pro uživatele ${user.id} bylo úspěšně uloženo.`);
            
        } else {
            console.log(`Ignorování události typu: ${event.type}`);
        }

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Chyba při zpracování Stripe webhooku:', error.message);

        return new NextResponse(JSON.stringify({
            message: 'Chyba na serveru při zpracování webhooku',
            error: error.message,
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}