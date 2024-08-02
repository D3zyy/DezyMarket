import { getSession,logOut } from "../../authentication/actions";
import { prisma } from "@/app/database/db";
import { checkUserBan } from "./dbMethodsSession";

// Handler for GET requests
export async function GET(req) {
  console.log("GET session HIT")
  // Kontrola zda se session  nachází v db
  

  try {
    const session = await getSession();

    let banTill = false
    let messageBan = false
    let ban = false
    if(session.userId){
      ban = await checkUserBan(session.userId)
      console.log(ban.pernament)
      if (ban.pernament == true) {
        messageBan = "Váš účet byl trvale zablokován"
      }  else{
       messageBan = `Účet byl zabanován do: ${ban.banTill}`
      }
    }
    

    if (session.isLoggedIn && !ban) {
      console.log("neni zabanovan")
      return new Response(JSON.stringify(session), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else if (session.isLoggedIn && ban) {
       console.log(ban)
       await logOut()
       
      return new Response(JSON.stringify({ message: messageBan }), {
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