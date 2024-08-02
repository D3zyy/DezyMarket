import { getSession,logOut } from "../../authentication/actions";

// Handler for GET requests
export async function GET(req) {
 

  try {
    const session = await getSession();

    if (!session) {
      return new Response(JSON.stringify(), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify(session), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
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