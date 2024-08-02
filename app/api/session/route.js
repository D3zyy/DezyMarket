import { getSession,logOut } from "../../authentication/actions";
import { prisma } from "@/app/database/db";
import { checkUserBan } from "./dbMethodsSession";

// Handler for GET requests
export async function GET(req) {
  console.log("GET session HIT")
  // Kontrola zda se session  nachází v db
  

  try {
    const session = await getSession();
    console.log(session.userId)
    let banTill = false
    if(session.userId){
      banTill = await checkUserBan(session.userId)
    }
    

    if (session.isLoggedIn && !banTill) {
      console.log("neni zabanovan")
      return new Response(JSON.stringify(session), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else if (session.isLoggedIn && banTill) {
       console.log(banTill)
       await logOut()
      return new Response(JSON.stringify({ message: `Uživatel zabanován do: ${banTill}` }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    else{
     
      return new Response(JSON.stringify("Donť try to test this"), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    
  } catch (error) {
    console.error("Chyba posílaní session:", error);
    return new Response(JSON.stringify({ message: "Chyba na serveru [GET metoda session]" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}


export async function DELETE(req) {
  console.log("DELETE method hit on /api/session");

  try {

    await logOut()
    return new Response(JSON.stringify(), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Chyba níčení session:", error);
    return new Response(JSON.stringify({ message: "Chyba na serveru [DELETE metoda session] " }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}