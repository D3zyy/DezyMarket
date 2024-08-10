import { getSession } from './app/authentication/actions'
import { prisma } from '@/app/database/db';



export async function GET(req) {
    try {
    const session = await getSession();
    if(!session){
      return new Response(JSON.stringify({  message: "Uživatel není přihlášen" }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
  }
    console.log("session uživatele : ",session)
    const user = await prisma.Users.findUnique({
      where: {
        userId: session.userId,
      },
    });
    console.log("typ účtu : ",user.AccountType)
    
    if(user.AccountType){


      // Return the appropriate response
      return new Response(JSON.stringify(false), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else{
      return new Response(JSON.stringify(true), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  
    } catch (error) {
      console.error("Chyba níčení session:", error);
  
      // Return a 500 Internal Server Error response on exception
      return new Response(JSON.stringify({ message: "Chyba na serveru [GET metoda HasAccountType]" }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }