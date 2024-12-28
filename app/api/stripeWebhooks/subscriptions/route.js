import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Upravte cestu k Prisma instanci
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
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;

            // Získání údajů o předplatném a uživateli
            const userEmail = session.customer_details.email; // ID uživatele z vaší aplikace
            const subscriptionId = session.subscription; // ID předplatného na Stripe
            const accountTypeId = session.metadata.accountTypeId; // Přidáno do metadat
            const startDate = new Date(); // Počáteční datum
            const endDate = new Date(); // Nastavte délku předplatného
            endDate.setMonth(endDate.getMonth() + 1); // Např. na 1 měsíc




            const subscriptions = await stripe.subscriptions.list({
                customer: customer.id,
                status: "active"
            });
    
    
            const subscription = subscriptions.data[0];
    
            console.log(subscription.current_period_end)

                // Convert the timestamp to a date
            const date = new Date(subscription.current_period_end * 1000);
            const day = date.getDate();
            const month = date.getMonth() + 1; // Months are 0-indexed
            const year = date.getFullYear();

            // Format the date as day.month.year
            const nextPayment = `${day}.${month}.${year}`;
            const cancelAtPeriodEnd = subscription.cancel_at_period_end

            // Uložení do databáze pomocí Prisma
            await prisma.AccountTypeUsers.create({
                data: {
                    accountTypId: accountTypeId,
                    fromDate: startDate,
                    toDate: endDate,
                    userId: userId,
                },
            });

            console.log(`Předplatné pro uživatele ${userId} bylo úspěšně uloženo.`);
        }

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Chyba při zpracování Stripe webhooku:', error.message);

        return new NextResponse(JSON.stringify({
            message: 'Chyba na serveru [POST] požadavek webhook přidání předplatného do db'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}