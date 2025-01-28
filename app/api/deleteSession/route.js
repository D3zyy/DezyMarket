import { prisma } from "@/app/database/db";
import { getSession } from "@/app/authentication/actions";
import { DateTime } from "luxon";

export async function POST(req) {
  try {
    let userToBreak
    const session = await getSession();
    if (!session || !session.isLoggedIn) {
      return new Response(
        JSON.stringify({ message: "Uživatel není přihlášen" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    if(session.role.privileges <= 1){
        return new Response(
            JSON.stringify({ message: "Na tento příkaz nemáte oprávnění" }),
            {
              status: 403,
              headers: { "Content-Type": "application/json" },
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
          return new Response(JSON.stringify({
            message: 'Již jste vyčerpal administrativních pravomocí dnes'
          }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
        }

    const data = await req.json();
    console.log("Data na ničení session:", data);

    if (!data.sessionId) {
      return new Response(
        JSON.stringify({ message: "sessionId není poskytován" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

     userToBreak = await prisma.sessions.findFirst({
      where: { id: data.sessionId },
      include: { user: true },
    });
    console.log("tenhle:",userToBreak)
    await prisma.sessions.delete({
      where: { id: data.sessionId },
    });

    const nowww = DateTime.now()
    .setZone('Europe/Prague')
    .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
    await prisma.managementActions.create({
      data: {
        doneAt: nowww,
        info: `Zničení session`,
        fromUser: {
          connect: { id: session.userId }, // Link the user by its unique identifier
        },
        toUser : {
          connect : { id: userToBreak.user.id}
        }

      },
    });
   console.log("vyřešeno")
    return new Response(
      JSON.stringify({ message: "Session byla úspěšně smazána" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Chyba při mazání session:", error);
    return new Response(
      JSON.stringify({ message: "Chyba na serveru při mazání session" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await prisma.$disconnect(); // Uzavřete připojení po dokončení
  }
}