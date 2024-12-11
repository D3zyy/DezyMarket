import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";

import { DateTime } from 'luxon';

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    try {
        // Ensure the session is retrieved correctly
        const session = await getSession();
        if (!session || !session.isLoggedIn || !session.email) {
            return new Response(JSON.stringify({
                message: "Chyba na serveru [POST] požadavek na získání informací o předplatném pro upgrade. Session nebyla nalezena"
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
        let data = await request.json();
        const customer = customers.data[0];
       
        console.log("Na co chci upgradovat:",data.nameToUpgrade)
        async function getProductPrice(defaultPriceId) {
            try {
                const price = await stripe.prices.retrieve(defaultPriceId); // Načtení detailů ceny
                return price.unit_amount / 100; // Cena je vrácena v centech, takže ji převedeme na celé jednotky
            } catch (error) {
                console.error('Chyba při získávání ceny:', error);
                throw error;
            }
        }
        async function getProductByName(nameToUpgrade) {
            try {
                const products = await stripe.products.list(); // Získání seznamu všech produktů
                const product = products.data.find(product => product.name === nameToUpgrade); // Hledání podle názvu
                
                if (product) {
                    console.log("produkt:",product)
                    return product;
                } else {
                  
                    return null;
                }
            } catch (error) {
                console.error('Chyba při získávání produktu:', error);
                throw error;
            }
        }
        
        
        let productExist = await getProductByName(data.nameToUpgrade);

        if(!productExist){
            return new Response(JSON.stringify({
              message: "Tento produkt neexistuje"
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        console.log("existuje produtk s tímto názvem co byl poslán na API:",productExist.id)
        // Funkce pro kontrolu, zda zákazník již má produkt
async function checkCustomerSubscription(customerId, productId) {
    try {
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'active',
            expand: ['data.items.data.plan'], // Rozbalí ID produktu
        });

        for (const subscription of subscriptions.data) {
            const hasProduct = subscription.items.data.some(
                item => item.price.product === productId
            );

            if (hasProduct) {
                return true; // Zákazník již má produkt
            }
        }

        return false; // Produkt nebyl nalezen v žádném předplatném
    } catch (error) {
        console.error('Chyba při kontrole předplatného:', error);
        throw error;
    }
}
let priceOfDesiredSub = await getProductPrice(productExist.default_price)
console.log("Cena předplatného co chce:",priceOfDesiredSub)
let alreadyHaveTHisSub = await checkCustomerSubscription(customer.id,productExist.id)
console.log("Již má poslaný produkt :",alreadyHaveTHisSub)

if(alreadyHaveTHisSub){
    return new Response(JSON.stringify({
      message: "Toto předplatné již máte"
    }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
    });
}
        // Retrieve subscriptions for the customer
        const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            status: "active",
            expand: ['data.items.data.price'], // Rozbalí objekt price pro kontrolu ID
        });
        
        // Najde první předplatné, kde cena není 0
        const nonZeroPriceSubscription = subscriptions.data.find(subscription => {
            // Projde všechny položky předplatného (může jich být více)

            return subscription.items.data.some(item => item.price.unit_amount > 0);
        });
        let subscriptionInfo;
        if (nonZeroPriceSubscription) {
         
             subscriptionInfo = await stripe.subscriptions.retrieve(nonZeroPriceSubscription.id);
            
        } 

        const subscription = subscriptions.data[0];
        const product = await stripe.products.retrieve(subscriptionInfo.plan.product);
        console.log("produkt předpaltného co má:",product)
        let priceOfAlreadySub = await getProductPrice(product.default_price)
        console.log("Cena předplatného co již má:",priceOfAlreadySub)
        console.log("Cena předplatného co chce :",priceOfDesiredSub)
        if(priceOfAlreadySub > priceOfDesiredSub){
            return new Response(JSON.stringify({
                message: "Toto předplatné nelze upgradovat"
              }), {
                  status: 403,
                  headers: { 'Content-Type': 'application/json' }
              });
        }
        console.log("Předplatné zakaznika začalo:",nonZeroPriceSubscription.current_period_start)
        console.log("Předplatné zakaznika začalo:",nonZeroPriceSubscription.current_period_end)
       // Funkce pro výpočet upgrade ceny
       async function calculateUpgradeCost(priceOfAlreadySub, priceOfDesiredSub, startDateUnix, endDateUnix, currentDateUnix) {
        // Převod Unixového času na DateTime objekt
        const startDate = DateTime.fromSeconds(startDateUnix).setZone('Europe/Prague');
        const endDate = DateTime.fromSeconds(endDateUnix).setZone('Europe/Prague');
        const currentDate = DateTime.fromSeconds(currentDateUnix).setZone('Europe/Prague');
        
        // Výpočet celkového počtu dní v období (včetně počátečního a koncového dne)
        const totalDays = endDate.diff(startDate, 'days').days + 1;  // +1 zahrnuje i poslední den
    
        // Výpočet zbývajících dní (od aktuálního data do konce období)
        const remainingDays = endDate.diff(currentDate, 'days').days + 1;  // +1 zahrnuje i dnešek
    
        // Ošetření případu, kdy zbývající dny jsou záporné (např. pokud je aktuální datum po skončení období)
        if (remainingDays < 0) {
            console.log("Aktuální datum je po skončení období. Žádné dny k dispozici.");
            return 0;
        }
    
        // Výpočet denní ceny pro aktuální a požadované předplatné
        const dailyPriceCurrent = priceOfAlreadySub / totalDays;
        const dailyPriceDesired = priceOfDesiredSub / totalDays;
    
        // Výpočet poměrné částky za zbývající dny pro oba plány
        const remainingValueCurrent = dailyPriceCurrent * remainingDays;
        const remainingValueDesired = dailyPriceDesired * remainingDays;
    
        // Rozdíl (upgrade částka), kterou musí zákazník doplatit
        const upgradeCost = remainingValueDesired - remainingValueCurrent;
    
        // Výpis výsledků
        console.log(`Celkový počet dní v období: ${totalDays}`);
        console.log(`Zbývající dny: ${remainingDays}`);
        console.log(`Denní cena aktuálního předplatného: ${dailyPriceCurrent.toFixed(2)} Kč`);
        console.log(`Denní cena požadovaného předplatného: ${dailyPriceDesired.toFixed(2)} Kč`);
        console.log(`Poměrná částka za zbývající dny u aktuálního předplatného: ${remainingValueCurrent.toFixed(2)} Kč`);
        console.log(`Poměrná částka za zbývající dny u požadovaného předplatného: ${remainingValueDesired.toFixed(2)} Kč`);
        console.log(`Celková částka za upgrade (doplatek): ${upgradeCost.toFixed(0)} Kč`);
    
        return upgradeCost.toFixed(0);
    }
    
    const currentDateUnix = Math.floor(DateTime.now().toSeconds()); 
    
 let  priceToUpgrade = await calculateUpgradeCost(priceOfAlreadySub, priceOfDesiredSub, nonZeroPriceSubscription.current_period_start, nonZeroPriceSubscription.current_period_end, currentDateUnix);
 if(priceToUpgrade < 15 ){
    priceToUpgrade = 15
}
if (!nonZeroPriceSubscription) {
            return new Response(JSON.stringify({
                message: "Žádné platící předplatné nenalezeno pro tohoto zákazníka"
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        

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
            scheduledToCancel: subscriptions.data[0].cancel_at_period_end,
            name : product.name,
            priceToUpgrade: priceToUpgrade,
            priceOfDesiredSub: priceOfDesiredSub
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
