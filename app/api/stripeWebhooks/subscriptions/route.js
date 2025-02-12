import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/database/db";
import { DateTime } from 'luxon';
import { getCachedData,invalidateCache } from "@/app/getSetCachedData/caching";
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

            console.log("PaymentIntent:", paymentIntent);

            // Získání emailu a subscription ID z PaymentIntent
            const userEmail = paymentIntent.customer_email;
            const subscriptionId = paymentIntent.subscription;

            if (!userEmail || !subscriptionId) {
                throw new Error("Chybí důležité informace: email nebo subscriptionId.");
            }

            console.log(`Zpracování platby pro uživatele: ${userEmail}`);

            // Načtení detailů předplatného z API Stripe
            let subscriptionDetails;
            try {
                subscriptionDetails = await stripe.subscriptions.retrieve(subscriptionId);
            } catch (err) {
                console.error("Chyba při získávání subscription detailů:", err.message);
                throw new Error("Nepodařilo se načíst detaily předplatného.");
            }

            if (!subscriptionDetails || !subscriptionDetails.metadata || !subscriptionDetails.metadata.name) {
                throw new Error("Metadata neobsahují potřebné informace o typu účtu.");
            }

            const accountTypeName = subscriptionDetails.metadata.name;

            // Načtení detailů z předplatného
            const currentPeriodStart = subscriptionDetails.current_period_start;
            const currentPeriodEnd = subscriptionDetails.current_period_end;
            const cancelAtPeriodEnd = subscriptionDetails.cancel_at_period_end;

            console.log('Current Period Start:', new Date(currentPeriodStart * 1000));
            console.log('Current Period End:', new Date(currentPeriodEnd * 1000));
            console.log('Cancel at Period End:', cancelAtPeriodEnd);

            // Načtení typu účtu z databáze
            const accToAcctivate = await prisma.AccountType.findFirst({
                where: { name: accountTypeName },
            });

            if (!accToAcctivate) {
                throw new Error(`Typ účtu "${accountTypeName}" nebyl nalezen.`);
            }

            // Načtení uživatele z databáze pomocí emailu
        
            const user = await getCachedData(`userEmail_${userEmail}`, () => prisma.users.findFirst({
                where: { email:userEmail }
                }), 600)
               await invalidateCache(`userEmail_${userEmail}`)
               await invalidateCache(`userAcc_${userEmail}`)
               await invalidateCache(`userRole_${user.userId}`)
            if (!user) {
                throw new Error(`Uživatel s e-mailem ${userEmail} nebyl nalezen.`);
            }

            // Výpočet aktuálního data pro fromDate a toDate
            const fromDate = DateTime.now()
                .setZone('Europe/Prague')
                .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");

          
            // Připočítání dní k toDate podle rozdílu mezi current_period_start a current_period_end
            const diffDays = Math.floor((currentPeriodEnd - currentPeriodStart) / (60 * 60 * 24));  // Výpočet rozdílu v dnech
            const toDate = DateTime.now()
                .setZone('Europe/Prague')
                .plus({ days: diffDays })  // Připočítáme dny k fromDate
                .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");

         

            if (paymentIntent.billing_reason === "subscription_create") {
                console.log("Payment intent:",paymentIntent)
                // přidám s jakou cenou je vytvořeno
                console.log("Tohle davam do db jako priceId",paymentIntent.subscription_details.metadata.priceId)
                await prisma.AccountTypeUsers.create({
                    data: {
                        price: { connect: { priceCode: paymentIntent.subscription_details.metadata.priceId } },
                        active: true,
                        scheduleToCancel: cancelAtPeriodEnd,
                        nextPayment: toDate,  // Nastavení příští platby
                        fromDate: fromDate,
                        toDate: toDate,
                        user: { connect: { id: user.id } },
                        accountType: { connect: { id: accToAcctivate.id } },
                    },
                });
                console.log(`Vytvořeno nové předplatné pro uživatele ${user.id}.`);
            } else if (paymentIntent.billing_reason === "subscription_cycle") {
              
               
            
                // Find the AccountTypeId by its name
                const accountType = await prisma.AccountType.findFirst({
                    where: { name: paymentIntent.subscription_details.metadata.name },
                });


                const updated = await prisma.AccountTypeUsers.findFirst({
                    where: {
                        active: true,
                        userId: user.id,
                        scheduleToCancel: false,
                        accountTypeId: accountType.id
                    },
                });
                
                if (updated) {
                    // Načtení původního `nextPayment` a `toDate`
                    const currentNextPayment = DateTime.fromISO(updated.nextPayment);  // Předpokládáme, že je ve formátu ISO 8601
                    const currentToDate = DateTime.fromISO(updated.toDate);            // Předpokládáme, že je ve formátu ISO 8601
                
                    // Přidání 1 měsíce k těmto datům
                    const newNextPayment = currentNextPayment.plus({ months: 1 }).toISO();
                    const newToDate = currentToDate.plus({ months: 1 }).toISO();
                
                    // Aktuální měsíc (pokud potřebujete zvýšit `monthIn`)
                    const newMonthIn = updated.monthIn + 1;
                
                    // Aktualizace v databázi
                    const updatedAccount = await prisma.AccountTypeUsers.update({
                        where: {
                            id: updated.id, // Aktualizujeme podle ID z načtené položky
                        },
                        data: {
                            nextPayment: newNextPayment,
                            toDate: newToDate,
                            monthIn: newMonthIn,
                        },
                    });
                
                   
                } else {
                    console.log('Předplatné nenalezeno.');
                }

               

                console.log(`Aktualizováno předplatné pro uživatele ${user.id}.`);
            }
        }  if (event.type === 'invoice.payment_failed') {
            const paymentIntent = event.data.object;

            console.log("PaymentIntent failed!!!!!!:", paymentIntent);
            
            if (paymentIntent.billing_reason === "subscription_cycle") {
                const endOfSubscription = DateTime.now()
                    .setZone('Europe/Prague')
                    .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            
                // Get the user based on their email
 
                const user = await getCachedData(`userEmail_${paymentIntent.customer_email }`, () => prisma.users.findFirst({
                    where: { email:paymentIntent.customer_email  }
                    }), 600)

                    await invalidateCache(`userEmail_${paymentIntent.customer_email }`)
                    await invalidateCache(`userAcc_${paymentIntent.customer_email}`)
                    await invalidateCache(`userRole_${user.userId}`)
                // Find the AccountTypeId by its name
                const accountType = await prisma.AccountType.findFirst({
                    where: { name: paymentIntent.subscription_details.metadata.name },
                });
                
                if (accountType) {
                    // Update the AccountTypeUsers record using AND for the conditions
                    const updatedAccount = await prisma.AccountTypeUsers.updateMany({
                        where: {
                            AND: [
                                { userId: user.id },
                                { accountTypeId: accountType.id },
                                { active: true }
                            ]
                        },
                        data: {
                            nextPayment: '',
                            toDate: endOfSubscription,
                            active: false,
                        },
                    });
                   
                } else {
                  
                }
            }

        }
        if (event.type === 'customer.subscription.deleted') {
            console.log("HIT webhook subscription deleted")
            const paymentIntent = event.data.object;

            console.log("Subscription canceled!!!!!!:", paymentIntent);
const endOfSubscription = DateTime.now()
                    .setZone('Europe/Prague')
                    .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
                const customer = await stripe.customers.retrieve(paymentIntent.customer);
                let customerEmail = customer.email
                // Get the user based on their email
 
                
                const user = await getCachedData(`userEmail_${customerEmail }`, () => prisma.users.findFirst({
                    where: { email:customerEmail  }
                    }), 600)
                    await invalidateCache(`userEmail_${customerEmail}`)
                    await invalidateCache(`userAcc_${customerEmail}`)
                    await invalidateCache(`userRole_${user.userId}`)
  
                console.log("Uživatel kterému bylo zrušeno předplatné:",user)
                // Find the AccountTypeId by its name
                const accountType = await prisma.AccountType.findFirst({
                    where: { name: paymentIntent.metadata.name },
                });
                console.log("Uživatel kterému bylo zrušeno předplatné typ účtu:",accountType)
                if (accountType) {
                    console.log("Učet nalezen")
                    // Update the AccountTypeUsers record using AND for the conditions
                    const updatedAccount = await prisma.AccountTypeUsers.updateMany({
                        where: {
                            AND: [
                                { userId: user.id },
                                { accountTypeId: accountType.id },
                                { active: true }
                            ]
                        },
                        data: {
                            nextPayment: '',
                            toDate: endOfSubscription,
                            active: false,
                        },
                    });
                    console.log("Učet aktualizován")
                }
            }

     

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
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
                    info: `Chyba na /api/stripeWebHooks/subscriptions - POST - (catch)`,
                    dateAndTime: dateAndTime,
                    errorPrinted: error,
                    ipAddress:ip },
                  })
      
                }catch(error){}
        console.error('Chyba při zpracování Stripe webhooku:', error.message);

        return new NextResponse(JSON.stringify({
            message: 'Chyba na serveru při zpracování webhooku',
            error: error.message,
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }finally {
        await prisma.$disconnect(); // Uzavřete připojení po dokončení
    }
}