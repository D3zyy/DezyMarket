import {  NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
import { DateTime } from "luxon";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


export async function POST(request) {
  let   accTypeId, newPrice,session
  try {
    ({ accTypeId, newPrice } = await request.json());
     session = await getSession();
    if (!session || !session.isLoggedIn || !session.email) {
      return new Response(
        JSON.stringify({ message: 'Chyba na serveru [POST] požadavek na nastavení základní typ účtu. Session nebyla nalezena' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    if(session.role.privileges <= 2){
     
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
              info: `Chyba na /api/changePrice - POST - (Na tento příkaz nemáte pravomoce) newPrice: ${newPrice} accId: ${accTypeId} `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip },
            })
        return new Response(
            JSON.stringify({ message: 'Na tento příkaz nemáte práva' }),
            {
              status: 404,
              headers: { 'Content-Type': 'application/json' }
            }
          );
    }


    if(newPrice <= 100){
      
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
              info: `Chyba na /api/changePrice - POST - (Cena není platná) newPrice: ${newPrice} accId: ${accTypeId} `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip },
            })
      return new Response(
        JSON.stringify({ message: 'Cena není platná' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    const currentDate = DateTime.now()
    .setZone('Europe/Prague')
    .toFormat('yyyy-MM-dd');
    let numberOfActionsToday = await prisma.managementActions.count({
      where: {
        fromUserId: session.userId,
        doneAt: {
          gte: new Date(`${currentDate}T00:00:00.000Z`),
          lt: new Date(`${currentDate}T23:59:59.999Z`),
        },
      },
    });
  
    if(session.role.privileges  === 2 && numberOfActionsToday > 100 || session.role.privileges  === 3 && numberOfActionsToday > 200 ){

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
              info: `Chyba na /api/changePrice - POST - (Již jste vyčerpal admn. pravomocí) newPrice: ${newPrice} accId: ${accTypeId} `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip },
            })

      return new Response(JSON.stringify({
        message: 'Již jste vyčerpal administrativních pravomocí dnes'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }





       console.log("AccID:",accTypeId)
       console.log("newPriceValue:",newPrice)



  let   alreadyHaveThisPrice =    await prisma.prices.findMany({
        where: { value:  parseInt(newPrice) }, });

console.log("Již mám tuto cenu v db :",alreadyHaveThisPrice)
if(alreadyHaveThisPrice.length > 0){
    console.log("Již eistuje tato cena")





    console.log("Cislo typ:",accTypeId)
  let upd =  await prisma.accountTypeOnPrices.updateMany({
        where: { accountTypeId: accTypeId },
        data:{ priceId: alreadyHaveThisPrice[0].id}
      });
console.log("updedd:",upd)

}else{
    console.log("Tato cena neexistuje vytvořím novou ")
    let   thisAcc =    await prisma.accountType.findFirst({
        where: { id: accTypeId }, });
    
        console.log("Tnehle uce tz db:",thisAcc)
    
        const existingProducts = await stripe.products.list();
        console.log("Vsechny produkty ze stripu:",existingProducts)
     const thisProductWannaUpdate = existingProducts.data.find(p => p.name == thisAcc.name);
        console.log("tenhle produkt ze stirpu updautji cenu:",thisProductWannaUpdate)

    const price = await stripe.prices.create({
        unit_amount: parseInt(newPrice) * 100, // Cena v haléřích (CZK * 100)
        currency: 'czk', // Měna
        product: thisProductWannaUpdate.id, // ID produktu na Stripe
        recurring: {
          interval: 'month', // Interval platby (měsíčně)
        },
      });
    
      console.log("Tuhle cenu jsem vytvoril na stripe :",price)


        const createdPrice = await prisma.prices.create({
            data: {
              value: parseInt(newPrice),
              priceCode: price.id,  // Pro tento účet nemáme cenu na Stripe
            },
          });


            console.log("New price in db:".createdPrice)
        await prisma.accountTypeOnPrices.updateMany({
            where: { accountTypeId: accTypeId },
            data:{ priceId: createdPrice.id}
          });

}




  
   




    const nowww = DateTime.now()
    .setZone('Europe/Prague')
    .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
    await prisma.managementActions.create({
      data: {
        doneAt: nowww,
        info: `Updated  price value: ${newPrice} accId: ${accTypeId}`,
        fromUser: {
          connect: { id: session.userId }, // Link the user by its unique identifier
        },
      },
    });



   


    return new NextResponse(
        JSON.stringify({ message: 'Úspěšná aktualizace  perku' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );

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
              info: `Chyba na /api/changePrice - POST - (catch) newPrice: ${newPrice} accId: ${accTypeId} `,
              dateAndTime: dateAndTime,
              errorPrinted: error,
              userId: session?.userId,
              ipAddress:ip },
            })

          }catch(error){}
    console.error('Chyba při vytváření požadavku na nastavení základního typu předplatného: ', error);
    return new Response(
      JSON.stringify({ message: 'Chyba na serveru [POST] požadavek na základní typ předplatného' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } finally {
    await prisma.$disconnect(); // Uzavřete připojení po dokončení
  }
}