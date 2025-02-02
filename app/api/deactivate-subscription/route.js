import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
import { prisma } from "@/app/database/db";
import { DateTime } from "luxon";

export async function POST(req) {
    let data ,session
    try {
 
        try {
   
             data = await req.json();
            console.log("DATA NA DEAKTIVACI :",data)
          } catch (error) {
            return new Response(JSON.stringify({ message: "Chybně formátovaný požadavek." }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        // Ensure the session is retrieved correctly
         session = await getSession();
        if (!session || !session.isLoggedIn || !session.email) {
            return new Response(JSON.stringify({
                message: "Chyba na serveru [POST] požadavek na deaktivaci předplatného . Session nebyla nalezena "
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        console.log("nahore")
        let usrToCancel
        let myAcc = true
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
        req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
        req.headers.get("x-real-ip") ||                      // Alternativní hlavička
        req.socket?.remoteAddress ||                         // Lokální fallback
        null;
      
      // Odstranění případného prefixu ::ffff:
      const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
      
    
      
            const dateAndTime = DateTime.now()
            .setZone('Europe/Prague')
            .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
              await prisma.errors.create({
                data:{
                info: `Chyba na /api/deactivate-subscription - POST - (Již jste vyčerpal adm. pravomocí) data: ${data} `,
                dateAndTime: dateAndTime,
                userId: session?.userId,
                ipAddress:ip,}
              })
                return new Response(JSON.stringify({
                message: 'Již jste vyčerpal administrativních pravomocí dnes'
              }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
              });
            }
        if(data.usrId != null){
            if(session.role.privileges > 2){

         
         usrToCancel = await prisma.users.findFirst({
            where: { id: data.usrId },
            include: {role : true}
        });
        if(!usrToCancel){

      
        const rawIp =
        req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
        req.headers.get("x-real-ip") ||                      // Alternativní hlavička
        req.socket?.remoteAddress ||                         // Lokální fallback
        null;
      
      // Odstranění případného prefixu ::ffff:
      const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
      
    
      
            const dateAndTime = DateTime.now()
            .setZone('Europe/Prague')
            .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
              await prisma.errors.create({
                data:{
                info: `Chyba na /api/deactivate-subscription - POST - (Uživatel na deaktivaci nenalezen) data: ${data} `,
                dateAndTime: dateAndTime,
                userId: session?.userId,
                ipAddress:ip,}
              })
            return new Response(JSON.stringify({
                message: "Uživatel na deaktivaci  nenalezen "
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        console.log("THis uset wanna cancel:",usrToCancel )
        console.log("nahore 1")
        if(usrToCancel.role.privileges > session.role.privileges){
            
     
        const rawIp =
        req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
        req.headers.get("x-real-ip") ||                      // Alternativní hlavička
        req.socket?.remoteAddress ||                         // Lokální fallback
        null;
      
      // Odstranění případného prefixu ::ffff:
      const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
      
    
      
            const dateAndTime = DateTime.now()
            .setZone('Europe/Prague')
            .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
              await prisma.errors.create({
                data:{
                info: `Chyba na /api/deactivate-subscription - POST - Nemám oprávnění deaktivovat uživateli s vetšími právy) data: ${data} `,
                dateAndTime: dateAndTime,
                userId: session?.userId,
                ipAddress:ip,}
              })
            return new Response(JSON.stringify({
                message: "Nemáte oprávnění "
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        myAcc = false
    }  else {

      
        const rawIp =
        req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
        req.headers.get("x-real-ip") ||                      // Alternativní hlavička
        req.socket?.remoteAddress ||                         // Lokální fallback
        null;
      
      // Odstranění případného prefixu ::ffff:
      const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
      
    
      
            const dateAndTime = DateTime.now()
            .setZone('Europe/Prague')
            .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
              await prisma.errors.create({
                data:{
                info: `Chyba na /api/deactivate-subscription - POST - Nemáte oprávnění) data: ${data} `,
                dateAndTime: dateAndTime,
                userId: session?.userId,
                ipAddress:ip,}
              })
        return new Response(JSON.stringify({
            message: "Nemáte oprávnění "
        }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    }
    console.log("Jeeee gifteeedd:",data.gifted)
    if(data.gifted){

        const accountType = await prisma.AccountType.findFirst({
            where: { name: data.name },
        });
        if(!accountType){

     
        const rawIp =
        req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
        req.headers.get("x-real-ip") ||                      // Alternativní hlavička
        req.socket?.remoteAddress ||                         // Lokální fallback
        null;
      
      // Odstranění případného prefixu ::ffff:
      const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
      
    
      
            const dateAndTime = DateTime.now()
            .setZone('Europe/Prague')
            .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
              await prisma.errors.create({         data:{
                info: `Chyba na /api/deactivate-subscription - POST - Zadaný typ účtu nenalezen (gifted)) data: ${data} `,
                dateAndTime: dateAndTime,
                userId: session?.userId,
                ipAddress:ip,}
              })
            return new Response(JSON.stringify({
                message: "Zadaný typ učtu nenalezen  "
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        console.log("YOOO")
        const updatedAccount = await prisma.AccountTypeUsers.updateMany({
            where: {
                AND: [
                    {   userId: myAcc ? session.userId : usrToCancel.id, },
                    { accountTypeId: accountType.id },
                    { active: true },
                    {scheduleToCancel: true,},
                    {gifted: true}
                ]
            
            },
            data: {
               active: false
            },
        });
        const nowww = DateTime.now()
        .setZone('Europe/Prague')
        .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
        await prisma.managementActions.create({
          data: {
            fromUserId: session.userId,
            doneAt: 
              nowww,
            
            toUserId: usrToCancel.id,
            info: `Zrušení giftlého předplatného`
          },
        });
        console.log("Updatued:",updatedAccount)
        return new Response(JSON.stringify({
            message: "Úspěšně deaktivoán giftlý sub"
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }

                // stripe check commented

                let customers
        if(myAcc) {

    
        // Retrieve customer information from Stripe
         customers = await stripe.customers.list({
            email: session.email
        });
    } else{ 
         customers = await stripe.customers.list({
            email: usrToCancel.email
        });
    }
    console.log("tadyyyy dole")

      //  if (!customers.data.length) {
        //    return new Response(JSON.stringify({
          //      message: "Žádný zákazník nenalezen s tímto emailem"
            //}), {
              //  status: 404,
                //headers: { 'Content-Type': 'application/json' }
           // });
        //}

        const customer = customers.data[0];
        console.log("tady")
        // Retrieve subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            status: "active"
        });
        if (!subscriptions.data.length) {

       
        const rawIp =
        req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
        req.headers.get("x-real-ip") ||                      // Alternativní hlavička
        req.socket?.remoteAddress ||                         // Lokální fallback
        null;
      
      // Odstranění případného prefixu ::ffff:
      const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
      
    
      
            const dateAndTime = DateTime.now()
            .setZone('Europe/Prague')
            .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
              await prisma.errors.create({
                data:{
                info: `Chyba na /api/deactivate-subscription - POST - (žádné předplatné nenalezeno pro tohoto zákazníka) data: ${data} `,
                dateAndTime: dateAndTime,
                userId: session?.userId,
                ipAddress:ip,}
              })
 
           return new Response(JSON.stringify({
                message: "Žádné předplatné nenalezeno pro tohoto zákazníka"
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
   
       if(subscriptions.data[0].cancel_at_period_end){

     
        const rawIp =
        req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
        req.headers.get("x-real-ip") ||                      // Alternativní hlavička
        req.socket?.remoteAddress ||                         // Lokální fallback
        null;
      
      // Odstranění případného prefixu ::ffff:
      const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
      
    
      
            const dateAndTime = DateTime.now()
            .setZone('Europe/Prague')
            .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
              await prisma.errors.create({
                data:{
                info: `Chyba na /api/deactivate-subscription - POST - (žádné aktivní předplatné nenalezeno není aktivní) data: ${data} `,
                dateAndTime: dateAndTime,
                userId: session?.userId,
                ipAddress:ip,}
              })

        console.log("zadne predplatne na cancel")
        return new Response(JSON.stringify({
            message: "Žádné aktivní předplatné nenalezeno"
        }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
       }
       console.log("tady po kotrole")
        const subscription = subscriptions.data[0];
        //const subscriptionInfo = await stripe.subscriptions.retrieve(subscription.id);
       //const product = await stripe.products.retrieve(subscriptionInfo.plan.product);
       //let producName =product.name;

       //if(producName != data.name){
        //return new Response(JSON.stringify({
        //}), {
          //  status: 403,
            //headers: { 'Content-Type': 'application/json' }
        //});
       //} else if(producName == data.name){

       const accountType = await prisma.AccountType.findFirst({
        where: { name: data.name },
    });
    console.log("tady po kotrole doleleee")
    if(!accountType){



        const rawIp =
        req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
        req.headers.get("x-real-ip") ||                      // Alternativní hlavička
        req.socket?.remoteAddress ||                         // Lokální fallback
        null;
      
      // Odstranění případného prefixu ::ffff:
      const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
      
    
      
            const dateAndTime = DateTime.now()
            .setZone('Europe/Prague')
            .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
              await prisma.errors.create({
                data:{
                info: `Chyba na /api/deactivate-subscription - POST - (Zadaný typ účtu nenalezen ) data: ${data} `,
                dateAndTime: dateAndTime,
                userId: session?.userId,
                ipAddress:ip,}
              })


        return new Response(JSON.stringify({
            message: "Zadaný typ učtu nenalezen  "
        }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    console.log("tady updatuji")
    const updatedAccount = await prisma.AccountTypeUsers.updateMany({
        where: {
            AND: [
                {   userId: myAcc ? session.userId : usrToCancel.id, },
                { accountTypeId: accountType.id },
                { active: true },
                {scheduleToCancel: false,},
                {gifted: false}
            ]
        
        },
        data: {
           scheduleToCancel: true
        },
    });
    if(!myAcc){

 
        const nowww = DateTime.now()
            .setZone('Europe/Prague')
            .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.managementActions.create({
              data: {
                fromUserId: session.userId,
                doneAt: 
                  nowww,
                
                toUserId: usrToCancel.id,
                info: `Deaktivace předplatného`
              },
            });
        }
    console.log("tady po updatuji")
    if(!updatedAccount){

 
        const rawIp =
        req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
        req.headers.get("x-real-ip") ||                      // Alternativní hlavička
        req.socket?.remoteAddress ||                         // Lokální fallback
        null;
      
      // Odstranění případného prefixu ::ffff:
      const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
      
    
      
            const dateAndTime = DateTime.now()
            .setZone('Europe/Prague')
            .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
              await prisma.errors.create({
                data:{
                info: `Chyba na /api/deactivate-subscription - POST - (žádné aktivní předplatné nenalezeno) data: ${data} `,
                dateAndTime: dateAndTime,
                userId: session?.userId,
                ipAddress:ip,}
              })





        return new Response(JSON.stringify({
            message: "Žádné aktivní předplatné nenalezeno"
        }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    console.log("tady po kontorla")

        await stripe.subscriptions.update(
            subscription.id,
            {cancel_at_period_end: true}
          );
      // }
       

      console.log("tady po updatuji na stripe s")



        return new Response(JSON.stringify({
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        try{
        const rawIp =
        req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
        req.headers.get("x-real-ip") ||                      // Alternativní hlavička
        req.socket?.remoteAddress ||                         // Lokální fallback
        null;
      
      // Odstranění případného prefixu ::ffff:
      const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
      
    
      
            const dateAndTime = DateTime.now()
            .setZone('Europe/Prague')
            .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
              await prisma.errors.create({
                data:{
                info: `Chyba na /api/deactivate-subscription - POST - (catch) data: ${data} `,
                dateAndTime: dateAndTime,
                errorPrinted: error,
                userId: session?.userId,
                ipAddress:ip,}
              })

            }catch(error){}


        console.error('Chyba na serveru [POST] požadavek na deaktivaci předplatného:  ', error);
        return new NextResponse(JSON.stringify({
            message: 'Chyba na serveru [POST] požadavek na deaktivaci  předplatném'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }finally {
        await prisma.$disconnect(); // Uzavřete připojení po dokončení
    }
}
