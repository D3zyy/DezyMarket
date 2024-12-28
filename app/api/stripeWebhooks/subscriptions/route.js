import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/database/db";
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
            console.log("session:",session)
            // Získání údajů o předplatném a uživateli
            const userEmail = session.customer_details?.email; // E-mail uživatele
            const subscriptionId = session.subscription; // ID předplatného na Stripe
            const accountTypeId = session.metadata?.accountTypeId; // Metadata z vytvořené session

            if (!userEmail || !subscriptionId || !accountTypeId) {
                throw new Error("Chybí důležité informace v session: email, subscriptionId nebo accountTypeId.");
            }

            console.log(`Zpracování předplatného pro uživatele: ${userEmail}`);

            // Načtení detailů předplatného z API Stripe
            let subscriptionDetails;
            try {
                subscriptionDetails = await stripe.subscriptions.retrieve(subscriptionId);
            } catch (err) {
                console.error("Chyba při získávání subscription detailů:", err.message);
                throw new Error("Nepodařilo se načíst detaily subscription.");
            }

            if (subscriptionDetails) {
                // Konkrétní data o předplatném
                const currentPeriodStart = subscriptionDetails.current_period_start; // Unix timestamp
                const currentPeriodEnd = subscriptionDetails.current_period_end; // Unix timestamp
                const status = subscriptionDetails.status; // Např. 'active', 'canceled', 'past_due', atd.
                const cancelAtPeriodEnd = subscriptionDetails.cancel_at_period_end; // true/false

                console.log('Current Period Start:', new Date(currentPeriodStart * 1000)); // Převod na JS Date
                console.log('Current Period End:', new Date(currentPeriodEnd * 1000));
                console.log('Status:', status);
                console.log('Cancel at Period End:', cancelAtPeriodEnd);

                // Načtení uživatele z databáze pomocí Prisma
                const user = await prisma.Users.findUnique({
                    where: {
                        email: userEmail,
                    },
                });

                if (!user) {
                    throw new Error(`Uživatel s e-mailem ${userEmail} nebyl nalezen.`);
                }

                // Uložení do databáze pomocí Prisma
                await prisma.AccountTypeUsers.create({
                    data: {
                        accountTypId: parseInt(accountTypeId, 10), // Převod na číslo, pokud je potřeba
                        scheduleToCancel: cancelAtPeriodEnd,
                        nextPayment: new Date(currentPeriodEnd * 1000),
                        fromDate: new Date(currentPeriodStart * 1000),
                        toDate: new Date(currentPeriodEnd * 1000),
                        userId: user.id,
                    },
                });

                console.log(`Předplatné pro uživatele ${user.id} bylo úspěšně uloženo.`);
            } else {
                throw new Error("Předplatné nebylo nalezeno.");
            }
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