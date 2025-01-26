import { prisma } from "@/app/database/db";
import { getSession } from "@/app/authentication/actions";

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session || !session.isLoggedIn) {
      return new Response(
        JSON.stringify({ message: 'Uživatel není přihlášen' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

   if(session.role.privileges <= 1){
    return new Response(
        JSON.stringify({ message: 'Na tento příkaz nemáte oprávnění' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
   }
   let data = await req.json();

   await prisma.posts.update({
    where: {
        id: data.postId
    },
    data: {
        visible: true
    }
});
    return new Response(
     
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Chyba při získávání sekcí:', error);
    return new Response(
      JSON.stringify({ message: 'Chyba na serveru při získávání sekcí' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } finally {
    await prisma.$disconnect(); // Uzavřete připojení po dokončení
  }
}