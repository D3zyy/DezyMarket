import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
import { DateTime } from 'luxon';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return new NextResponse(
        JSON.stringify({ message: 'Chyba na serveru [POST] požadavek na nastavení zakladní typ účtu. Session nebyla nalezena' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    let data = await request.json();
    const customers = await stripe.customers.list({
      email: session.email
    });
    const customer = customers.data[0];
    if (!customers.data.length) {
      return new Response(JSON.stringify({
        message: "Žádný zákazník nenalezen s tímto emailem"
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
 let  cardIdFromToBePaid =   data.cardId
 const paymentMethods = await stripe.paymentMethods.list({
    customer: customer.id,
    type: 'card',
});

// Kontrola, zda karta s daným ID existuje u tohoto zákazníka
const cardFound = paymentMethods.data.find(card => card.id === data.cardId);

if (cardFound) {
    console.log('Karta patří uživateli:', cardFound);
}  else {
    console.log("Karta nepatří uživateli")
    return new Response(JSON.stringify({
        message: "Tuto platební metodu nelze použít s tímto účtem"
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
if(!productExist){
    return new Response(JSON.stringify({
      message: "Tento produkt na upgrade neexistuje"
    }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
    });
}
let alreadyHaveTHisSub = await checkCustomerSubscription(customer.id,productExist.id)

   if(alreadyHaveTHisSub){
            return new Response(JSON.stringify({
              message: "Toto předplatné již máte nelze na něj upgradovat"
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
   }
  

  
   async function getProductPrice(defaultPriceId) {
    try {
        const price = await stripe.prices.retrieve(defaultPriceId); // Načtení detailů ceny
        return price.unit_amount / 100; // Cena je vrácena v centech, takže ji převedeme na celé jednotky
    } catch (error) {
        console.error('Chyba při získávání ceny:', error);
        throw error;
    }
}

const nonZeroPriceSubscription = subscriptions.data.find(subscription => {
    // Projde všechny položky předplatného (může jich být více)

    return subscription.items.data.some(item => item.price.unit_amount > 0);
});
let subscriptionInfo;
if (nonZeroPriceSubscription) {
 
     subscriptionInfo = await stripe.subscriptions.retrieve(nonZeroPriceSubscription.id);
    
} else{
    return new NextResponse(
        JSON.stringify({ message: 'Upgradnout lze pouze pokud již máte předplatné' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );

}
console.log("info o sub :",subscriptionInfo.items.data[0].id)
const product = await stripe.products.retrieve(subscriptionInfo.plan.product);
console.log("Jeho nínejší produkt",product)
let priceOfDesiredSub = await getProductPrice(productExist.default_price)
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
console.log("Předplatné zakaznika končí:",nonZeroPriceSubscription.current_period_end)
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
let  priceToUpgrade 
if(data.instantly){
    priceToUpgrade = await calculateUpgradeCost(priceOfAlreadySub, priceOfDesiredSub, nonZeroPriceSubscription.current_period_start, nonZeroPriceSubscription.current_period_end, currentDateUnix);
    if(priceToUpgrade < 15 ){
        priceToUpgrade = 15
    }
    const paymentMethods = await stripe.paymentMethods.list({
        customer: customer.id,
        type: 'card',
      });
      if (paymentMethods.data.length === 0) {
        return new NextResponse(
            JSON.stringify({ message: 'Vaši platební metodu se nepodařilo zpracovat' }),
            {
              status: 403,
              headers: { 'Content-Type': 'application/json' }
            }
          );
      }



      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: priceToUpgrade * 100, // částka v nejmenší měně, např. 1000 = 10.00 CZK
        currency: 'czk',
        customer: customer.id,
        payment_method: cardIdFromToBePaid,
        off_session: true,
        confirm: true,
        description: 'Upgrade předplatného Dezy.cz',
      });
      
      // Zkontrolujte, zda platba probíhla v pořádku
      if (paymentIntent.status === 'succeeded') {
        console.log("Platba byla úspěšná. Pokračuji v aktualizaci předplatného.");
      
        console.log("cele subscirption:", nonZeroPriceSubscription);
        console.log("id subscription to update:", nonZeroPriceSubscription.id);
        console.log("id produktu, který měním:", product.id);
        console.log("na jakou cenu měním:", productExist.default_price);
      
        // Aktualizace předplatného
        const updatedSubscription = await stripe.subscriptions.update(nonZeroPriceSubscription.id, {
          items: [{
            id: nonZeroPriceSubscription.items.data[0].id, // ID položky předplatného, kterou chcete změnit
            price: productExist.default_price, // Nové Price ID
          }],
          proration_behavior: 'none',  // Vytvoří prorata fakturaci na základě rozdílu
        });
      
        console.log("Předplatné bylo úspěšně aktualizováno.", updatedSubscription);
      } else {
        return new NextResponse(
            JSON.stringify({ message: 'Platba se nezdařila!' }),
      
            {
              status: 403,
              headers: { 'Content-Type': 'application/json' }
            }
          );
       
      }
  
  
   


} else {
     

      return new NextResponse(
        JSON.stringify({ message: 'Nelze upgradovat předplatné!', instant: false }),
  
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );





}






   

    return new NextResponse(
      JSON.stringify({ message: 'Uspěšně jste upgradovali předplatné!', instant: true }),

      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Chyba při vytvřání požadavku na nastavení základního typu předplatného : ', error);
    return new NextResponse(
      JSON.stringify({ message: 'Chyba na serveru [POST] požadavek na zakladní typ předplatného' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } finally {
    await prisma.$disconnect(); // Uzavřete připojení po dokončení
  }
}