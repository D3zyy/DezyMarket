import { prisma } from "@/app/database/db";
import { getSession } from "@/app/authentication/actions";

export async function POST(req) {
  try {
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

    await prisma.sessions.delete({
      where: { id: data.sessionId },
    });

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