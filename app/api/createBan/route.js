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