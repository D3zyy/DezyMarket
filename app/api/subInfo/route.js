import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import moment from "moment";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    try {
        // Ensure the session is retrieved correctly
        const session = await getSession();
        if (!session || !session.isLoggedIn || !session.email) {
            return new Response(JSON.stringify({
                message: "Chyba na serveru [POST] požadavek na získání informací o předplatném. Session nebyla nalezena nebo email není k dispozici"
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Retrieve customer information from Stripe
        const customers = await stripe.customers.list({
            email: session.email
        });

        if (!customers.data.length) {
            return new Response(JSON.stringify({
                message: "Žádný zákazník nenalezen s tímto emailem"
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const customer = customers.data[0];

        // Retrieve subscriptions for the customer
        const subscriptions = await stripe.subscriptions.list({
            customer: customer.id
        });

        if (!subscriptions.data.length) {
            return new Response(JSON.stringify({
                message: "Žádné předplatné nenalezeno pro tohoto zákazníka"
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const subscription = subscriptions.data[0];

        // Check if `current_period_end` is available
        if (!subscription.current_period_end) {
            return new Response(JSON.stringify({
                message: "Chyba: 'current_period_end' není k dispozici v předplatném"
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Convert the timestamp to a date
        const date = new Date(subscription.current_period_end * 1000);
        const day = date.getDate();
        const month = date.getMonth() + 1; // Months are 0-indexed
        const year = date.getFullYear();

        // Format the date as day.month.year
        const formattedDate = `${day}.${month}.${year}`;

        return new Response(JSON.stringify({
            nextPayment: formattedDate,
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Chyba na serveru [POST] požadavek informace o předplatném:  ', error);
        return new NextResponse(JSON.stringify({
            message: 'Chyba na serveru [POST] požadavek informace o předplatném'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}