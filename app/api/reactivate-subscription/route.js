import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
import { prisma } from "@/app/database/db";
import { DateTime } from "luxon";
export async function POST(req) {
    try {
        let data 
        try {
   
             data = await req.json();
            console.log("DATA NA REAKTIVACI SUB:",data)
          } catch (error) {
            return new Response(JSON.stringify({ message: "Chybně formátovaný požadavek." }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        // Ensure the session is retrieved correctly
        const session = await getSession();
        if (!session || !session.isLoggedIn || !session.email) {
            return new Response(JSON.stringify({
                message: "Chyba na serveru [POST] požadavek na deaktivaci předplatného . Session nebyla nalezena "
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

 


        let usrToReactivate
        let myAcc = true
        if(data.usrId != null){
            
            if(session.role.privileges > 2){

         
                usrToReactivate = await prisma.users.findFirst({
            where: { id: data.usrId },
            include: {role : true}
        });
        if(!usrToReactivate){
            return new Response(JSON.stringify({
                message: "Uživatel na reaktivaci  nenalezen "
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        console.log("THis uset wanna reactivte:",usrToReactivate )
   
        if(usrToReactivate.role.privileges > session.role.privileges ){
            console.log("tady nemam pravaaaaa")
            return new Response(JSON.stringify({
                message: "Nemáte oprávnění "
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        myAcc = false
    }  else {

        return new Response(JSON.stringify({
            message: "Nemáte oprávnění "
        }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    }

 if(!myAcc){


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
      return new Response(JSON.stringify({
        message: 'Již jste vyčerpal administrativních pravomocí dnes'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
}
    let customers

            
 if(myAcc) {
    console.log("Můj účet")
    
        // Retrieve customer information from Stripe
         customers = await stripe.customers.list({
            email: session.email
        });
    } else{ 
        console.log("Z pohledu admina reatkivuji ")
         customers = await stripe.customers.list({
            email: usrToReactivate.email
        });
    }



      //  if (!customers.data.length) {
        //    return new Response(JSON.stringify({
          //      message: "Žádný zákazník nenalezen s tímto emailem"
            //}), {
              //  status: 404,
                //headers: { 'Content-Type': 'application/json' }
           // });
        //}

        const customer = customers.data[0];
            console.log("Tenhle uživatel:",customer)
        // Retrieve subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            status: "active"
        });
        console.log("SUbs on stripe from this user:",subscriptions)
        if (!subscriptions.data.length) {
           return new Response(JSON.stringify({
                message: "Žádné předplatné nenalezeno pro tohoto zákazníka"
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

       if(!subscriptions.data[0].cancel_at_period_end){
        return new Response(JSON.stringify({
            message: "Žádné neaktivní předplatné nenalezeno"
        }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
       }
     
        const subscription = subscriptions.data[0];
        console.log("Togle sub budu reaktivoavt:",subscription)
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
    console.log("Tenhle účet:",accountType)
    if(!accountType){
        return new Response(JSON.stringify({
            message: "Zadaný typ učtu nenalezen  "
        }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    const updatedAccount = await prisma.AccountTypeUsers.updateMany({
        where: {
            AND: [
                {   userId: myAcc ? session.userId : usrToReactivate.id, },
                { accountTypeId: accountType.id },
                { active: true },
                {scheduleToCancel: true,},
                {gifted: false}
            ]
        
        },
        data: {
           scheduleToCancel: false
        },
    });
    console.log("Po updatu tenhle účet updatnutuje:",updatedAccount)
    if(!updatedAccount){
        return new Response(JSON.stringify({
            message: "Žádné aktivní předplatné nenalezeno"
        }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    console.log("Celé sub:",subscription)
    console.log("SUB iD:",subscription.id)

    await stripe.subscriptions.update(
        subscription.id,
        {cancel_at_period_end: false}
      );
if(!myAcc)
{

    const nowww = DateTime.now()
    .setZone('Europe/Prague')
    .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
    await prisma.managementActions.create({
      data: {
        fromUserId: session.userId,
        doneAt: 
          nowww,
        
        toUserId: usrToReactivate.id,
        info: `Obnovení  předplatného `
      },
    });

}
       
   
       





        return new Response(JSON.stringify({
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
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
