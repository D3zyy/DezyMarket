import { getSession,logOut } from "../../authentication/actions";
import { prisma } from "@/app/database/db";
import { checkUserBan } from "./dbMethodsSession";


// Handler for GET requests
export async function GET(req) {
  console.log("GET session HIT")
  
  

  try {
    const session = await getSession();

    
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
     
      return new Response(JSON.stringify({message: "Session nebyla nalezena"}), {
        status: 401,
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
  try {
    console.log("tady 0")
    // Call logOut and handle its response
    const { success, message, status } = await logOut(req);
    console.log("tady 1")
    // Return the appropriate response
    return new Response(JSON.stringify({  message }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Chyba níčení session:", error);

    // Return a 500 Internal Server Error response on exception
    return new Response(JSON.stringify({ message: "Chyba na serveru [DELETE metoda session]" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}