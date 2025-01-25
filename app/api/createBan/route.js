import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";

export async function POST(req) {
  try {
    const session = await getSession();

    if (!session || !session.isLoggedIn || !session.email) {
      return new Response(
        JSON.stringify({
          message:
            "Chyba na serveru [POST]: Session nebyla nalezena. Nelze vytvořit ban.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = await req.json();
    const { userId, bannedFrom, bannedTo, permanent, reason } = data;

    // Zkontrolujeme, zda má uživatel práva na vytvoření banu
    if (session?.role?.privileges <= 1) {
      return new Response(
        JSON.stringify({
          message: "Na tento příkaz nemáte oprávnění.",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Najdeme uživatele, který má být zabanován
    const userToBeBanned = await prisma.users.findUnique({
      where: { id: userId }, // Opraveno, aby bylo správné použití klíče
      include: { role: true }, // Zahrneme role uživatele
    });

    if (!userToBeBanned) {
      return new Response(
        JSON.stringify({
          message: "Uživatel, kterého chcete zabanovat, nebyl nalezen.",
        }),
        {
          status: 404,
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
    // Ověříme, zda má práva na zabanování uživatele s vyšším nebo stejným oprávněním
    if (userToBeBanned?.role?.privileges >= session?.role?.privileges) {
      return new Response(
        JSON.stringify({
          message:
            "Nemáte oprávnění zabanovat uživatele s vyšším nebo stejným oprávněním.",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    console.log(data)
    // Vytvoření banu
    const ban = await prisma.bans.create({
      data: {
        bannedFrom: bannedFrom,
        bannedTill: permanent ? null : bannedTo, // Pokud je pernamentní, bannedTo bude null
        pernament: permanent,
        reason: reason,
        fromUserId: session.userId,
        userId: userId,
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
            
            toUserId: userId,
            info: `Ban  trvale: ${permanent} od: ${bannedFrom}: do: ${bannedTo} duvod: ${reason}`
          },
        });
    return new Response(
      JSON.stringify({
        message: "Ban byl úspěšně vytvořen.",
        ban: ban,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Chyba při vytváření banu:", error);
    return new Response(
      JSON.stringify({ message: "Interní chyba serveru", success: false }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}