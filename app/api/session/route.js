import { logOut } from "../../authentication/actions";





export async function DELETE(req) {
  try {

    // Call logOut and handle its response
    const { success, message, status } = await logOut(req);
   
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