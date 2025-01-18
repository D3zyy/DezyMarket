import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
import { DateTime } from 'luxon';

export async function POST(request) {




  try {
    console.log("HIT")
    const session = await getSession();
    if (!session || !session.isLoggedIn || !session.email) {
        return new Response(JSON.stringify({
            message: "Chyba na serveru [POST] požadavek na získání informací o předplatném pro upgrade. Session nebyla nalezena"
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    let data = await request.json();

    console.log(session)
    if(session?.role?.privileges <= 1){
        return new Response(JSON.stringify({
            message: "Na tento příkaz nemáte oprávnění"
        }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    const ban = await prisma.bans.findUnique({
        where: {id: data?.banId},
        include: {
            fromUser: {
              include: {
                role: true, // Fetches the role of the user
              },
            },
          },

    })



    if(session?.role?.privileges > ban?.fromUser?.role?.privileges &&  session?.userId != ban?.userId  || session?.userId === ban?.fromUser?.id &&  session?.userId != ban?.userId ){
        const updateBan = await prisma.bans.update({
            where: {
              id: data.banId // Identifikátor banId, podle kterého se najde záznam
            },
            data: {
              bannedFrom: data.bannedFrom, // Ujistěte se, že datetime je správně naformátován
              bannedTill: data.isPermanent? null: data.bannedTo,     // Pokud je potřeba, upravte podle typu ve vaší databázi
              reason: data.reason,
              pernament: data.isPermanent
            }
          });
          
          


    } else {
        return new Response(JSON.stringify({
            message: "Na tento příkaz nemáte oprávnění"
        }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
    }
  
   
      
    return new Response(
      JSON.stringify({success: true}),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.log(error)
    return new Response(
      JSON.stringify({ message: 'Chyba na serceru update banu', success: false }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}