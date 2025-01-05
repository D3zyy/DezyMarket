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
    console.log("data co jsem dostal na server:",data)


    const accToUpgradExist = await prisma.AccountType.findFirst({
      where: { name: data.nameToUpgrade },
  });
  if (!accToUpgradExist) {
    return new NextResponse(
      JSON.stringify({ message: 'Účet který byl poslán že chcete upgradovat neexistuje' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  const accThatAlreadyhaveExist = await prisma.AccountType.findFirst({
    where: { name: data.fromName},
});
if (!accThatAlreadyhaveExist) {
  return new NextResponse(
    JSON.stringify({ message: 'Účet který byl poslán že máte neexistuje' }),
    {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
if(accThatAlreadyhaveExist.priority >= accToUpgradExist.priority){
  return new NextResponse(
    JSON.stringify({ message: 'Nelze upgradovat na daný účet' }),
    {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
const existWithuser = await prisma.AccountTypeUsers.findFirst({
  where: {
      active: true,
      userId: session.userId,
      accountType: {
          name : data.fromName  , 
           priority: {
            gt: 1, 
          },
      }
  },
});
console.log("Má ten co říká že má:",existWithuser)

if (!existWithuser) {
  return new NextResponse(
    JSON.stringify({ message: 'Účet který byl poslán že máte nebyl nalezen s vaším účtem' }),
    {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

const existWithuserWhichToUpgrade = await prisma.AccountTypeUsers.findFirst({
  where: {
      active: true,
      userId: session.userId,
      accountType: {
          name : data.nameToUpgrade  ,
      }
  },
});
console.log("Má ten co říká že chce:",existWithuserWhichToUpgrade)
if (existWithuserWhichToUpgrade) {
  return new NextResponse(
    JSON.stringify({ message: 'Účet který byl poslán že chcete upgradovat již máte' }),
    {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
// oba učty existují učet co chce nevlastní vlastní ten co říká že má a učet co chce má vetší prioritu než ten co má

const priceValueOfAlreadySub = await prisma.prices.findFirst({
  where: {
      priceCode: existWithuser.priceId,
  },
});

if(!priceValueOfAlreadySub){
  return new Response(JSON.stringify({
    message: "Žádná cena předplatného které máte nenalezena"
  }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' }
  });
}

const dateAndTime = DateTime.now()
  .setZone('Europe/Prague')
  .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");

// Adjusting the query logic for date range filter
const pricevalueOfDesiredSub = await prisma.accountTypeOnPrices.findFirst({
  where: {
    accountTypeId: accToUpgradExist.id,
    activeFrom: {
      lte: dateAndTime,  // activeFrom must be in the past or now
    },
    OR: [
      {
        activeTo: null,  // activeTo is null (indicating it's still valid indefinitely)
      },
      {
        activeTo: {
          gte: dateAndTime,  // activeTo must be in the future or now
        },
      },
    ],
  },
  include: {
    price: true,  // Fetch related price information
  },
});

if(!pricevalueOfDesiredSub){
  return new Response(JSON.stringify({
    message: "Žádná cena předplatného které chcete upgradovat nenalezena"
  }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' }
  });
}

const UnixFromDate = new Date("2024-12-29T17:01:59.000Z").getTime() / 1000; // Sekundy
const UnixTotoDate = new Date("2025-01-29T17:01:59.000Z").getTime() / 1000; // Sekundy






//kontrola karty id co byla poslána zda patří uživateli
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
}  else  {
    console.log("Karta nepatří uživateli")
    return new Response(JSON.stringify({
        message: "Tuto platební metodu nelze použít s tímto účtem"
      }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
      });
}
  



///////

async function calculateUpgradeCostt(priceOfAlreadySub, priceOfDesiredSub, startDateUnix, endDateUnix, currentDateUnix) {
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

  const currentDateUnix = Math.floor(
    DateTime.now().setZone('Europe/Prague').toSeconds()
  );
  let  priceToUpgradee 
  if(data.instantly){
    priceToUpgradee = await calculateUpgradeCostt(priceValueOfAlreadySub?.value, pricevalueOfDesiredSub?.price?.value, UnixFromDate,UnixTotoDate, currentDateUnix);
      if(priceToUpgradee < 15 ){
        priceToUpgradee = 15
      }
    }
    console.log("Cena nahore kolik to vyslo na upgrade:",priceToUpgradee)




//////




    // Retrieve subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "active",
      expand: ['data.items.data.price'], // Rozbalí objekt price pro kontrolu ID
  });


  



  


  


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




// Funkce pro výpočet upgrade ceny


  



      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: priceToUpgradee * 100, // částka v nejmenší měně, např. 1000 = 10.00 CZK
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
      
        // Aktualizace předplatného
        const updatedSubscription = await stripe.subscriptions.update(nonZeroPriceSubscription.id, {
          items: [{
            id: nonZeroPriceSubscription.items.data[0].id, // ID položky předplatného, kterou chcete změnit
            price: pricevalueOfDesiredSub?.price?.priceCode, // Nové Price ID
          }],
          proration_behavior: 'none',  // Neprovádí poměrné účtování
          metadata: {
            name: data.nameToUpgrade, // Aktualizace nebo přidání metadat
          },
        });
      

        //db update
        const updatedAccount = await prisma.AccountTypeUsers.updateMany({
          where: {
                id: existWithuser.id
          },
          data: {
              accountTypeId: accToUpgradExist.id,
              priceId: pricevalueOfDesiredSub?.price?.priceCode
          },
      });

         await prisma.AccountUpgrades.create({
        data: {
            dateTime: dateAndTime,
            AccountTypeIdBefore: accThatAlreadyhaveExist.id,
            AccountTypeIdAfter: accToUpgradExist.id,
            userId: session.userId,
            priceToUpgrade: parseInt(priceToUpgradee, 10)
          
        },
    });




      } else {
        return new NextResponse(
            JSON.stringify({ message: 'Platba se nezdařila!' }),
      
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