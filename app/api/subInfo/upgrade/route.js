import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
import { DateTime } from 'luxon';

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  let data,session
    try {
     
        // Ensure the session is retrieved correctly
         session = await getSession();
        if (!session || !session.isLoggedIn || !session.email) {
            return new Response(JSON.stringify({
                message: "Chyba na serveru [POST] požadavek na získání informací o předplatném pro upgrade. Session nebyla nalezena"
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        data = await request.json();
        console.log("Na co chci upgradovat infoUpgrade:",data.nameToUpgrade)
        console.log("Z čeho chci upgradovat infoUpgrade:",data.fromNameUp)


        const accToUpgradExist = await prisma.AccountType.findFirst({
            where: { name: data.nameToUpgrade },
        });
        if (!accToUpgradExist) {
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
              await prisma.create({ data: {
                info: `Chyba na /api/subInfo/upgrade - POST - (Účet který byl poslán že chcete upgradovat neexistuje) data: ${data}  `,
                dateAndTime: dateAndTime,
                userId: session?.userId,
                ipAddress:ip },
              })
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
              await prisma.create({ data: {
                info: `Chyba na /api/subInfo/upgrade - POST - (Účet který byl poslán že máte neexistuje) data: ${data}  `,
                dateAndTime: dateAndTime,
                userId: session?.userId,
                ipAddress:ip },
              })
        return new NextResponse(
          JSON.stringify({ message: 'Účet který byl poslán že máte neexistuje' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      if(accThatAlreadyhaveExist.priority >= accToUpgradExist.priority){
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
              await prisma.create({ data: {
                info: `Chyba na /api/subInfo/upgrade - POST - (Nelze upgradovat na daný účet má vetší prioritu) data: ${data}  `,
                dateAndTime: dateAndTime,
                userId: session?.userId,
                ipAddress:ip },
              })
        return new NextResponse(
          JSON.stringify({ message: 'Nelze upgradovat na daný účet' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      const dateAndTime = DateTime.now()
      .setZone('Europe/Prague')
      .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");

      const existWithuser = await prisma.AccountTypeUsers.findFirst({
        where: {
          active: true,
          userId: session.userId,
          accountType: {
            name: data.fromNameUp,
            priority: {
              gt: 1, 
            },
          },
        },
      });
      console.log("Má ten co říká že má:",existWithuser)
      
      if (!existWithuser) {
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
              await prisma.create({ data: {
                info: `Chyba na /api/subInfo/upgrade - POST - (Účet který byl poslán že máte nebyl nalezen s vaším účtem) data: ${data}  `,
                dateAndTime: dateAndTime,
                userId: session?.userId,
                ipAddress:ip },
              })
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
              await prisma.create({ data: {
                info: `Chyba na /api/subInfo/upgrade - POST - (Účet který byl poslán že chcete upgradovat již máte) data: ${data}  `,
                dateAndTime: dateAndTime,
                userId: session?.userId,
                ipAddress:ip },
              })
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
                await prisma.create({ data: {
                  info: `Chyba na /api/subInfo/upgrade - POST - (Žádná cena předplatného které máte nenalezena) data: ${data}  `,
                  dateAndTime: dateAndTime,
                  userId: session?.userId,
                  ipAddress:ip },
                })
        return new Response(JSON.stringify({
          message: "Žádná cena předplatného které máte nenalezena"
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }


     
    
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
                await prisma.create({ data: {
                  info: `Chyba na /api/subInfo/upgrade - POST - (Žádná cena předplatného které chcete upgradovat nenalezena) data: ${data}  `,
                  dateAndTime: dateAndTime,
                  userId: session?.userId,
                  ipAddress:ip },
                })
      return new Response(JSON.stringify({
        message: "Žádná cena předplatného které chcete upgradovat nenalezena"
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }


const UnixFromDate = new Date("2024-12-29T17:01:59.000Z").getTime() / 1000; // Sekundy
const UnixTotoDate = new Date("2025-01-29T17:01:59.000Z").getTime() / 1000; // Sekundy








        // Retrieve customer information from Stripe
        const customers = await stripe.customers.list({
            email: session.email
        });

        if (!customers.data.length) {
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
                await prisma.create({ data: {
                  info: `Chyba na /api/subInfo/upgrade - POST - (Žádný zákazník nenalezen s tímto emailem) data: ${data}  `,
                  dateAndTime: dateAndTime,
                  userId: session?.userId,
                  ipAddress:ip },
                })
            return new Response(JSON.stringify({
                message: "Žádný zákazník nenalezen s tímto emailem"
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const customer = customers.data[0];
        async function getCustomerCard(customerId) {
            try {
        
                // Získání uložených karet
                const paymentMethods = await stripe.paymentMethods.list({
                    customer: customerId,
                    type: 'card',
                });
                
                // Vytvoření pole obsahujícího požadované informace
                const cards = paymentMethods.data.map((method) => ({
                    id: method.id,
                    brand: method.card.brand,
                    last4: method.card.last4,
                }));
                
                console.log(cards);
                return cards
            } catch (error) {
                console.error('Chyba při načítání dat o zákazníkovi:', error);
            }
        }

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
    
    const currentDateUnix = Math.floor(
        DateTime.now().setZone('Europe/Prague').toSeconds()
      );
    
 let  priceToUpgrade = await calculateUpgradeCost(priceValueOfAlreadySub?.value, pricevalueOfDesiredSub?.price?.value, UnixFromDate, UnixTotoDate, currentDateUnix);
// console.log("Cena na upgrade:",priceToUpgrade)
 if(priceToUpgrade < 15 ){
    priceToUpgrade = 15
}


        


        // Convert the timestamp to a date
        const date = new Date(existWithuser.nextPayment);
        const day = date.getDate();
        const month = date.getMonth() + 1; // Months are 0-indexed
        const year = date.getFullYear();

        // Format the date as day.month.year
        const formattedDate = `${day}.${month}.${year}`;
        let  lastFourDigitsOfCustomerCard =  await getCustomerCard(customer.id);
      
        return new Response(JSON.stringify({    
            nextPayment: formattedDate,
            name : data.nameToUpgrade,
            priceOfDesiredSub: pricevalueOfDesiredSub?.price?.value,
            priceToUpgrade: priceToUpgrade,
            cards: lastFourDigitsOfCustomerCard

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
              await prisma.create({ data: {
                info: `Chyba na /api/subInfo/upgrade - POST - (catch) data: ${data}  `,
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
