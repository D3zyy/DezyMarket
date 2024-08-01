import { login } from "@/app/authentication/actions";

// Handler for GET requests for logging in
export async function POST(req) {
    console.log("GET method hit on /api/session/login");

    try {
        const { email, password } = await req.json();


        await login(email, password);
        return new Response(JSON.stringify(), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error("Chyba při přihlašování:", error);
        return new Response(JSON.stringify({ message: "Chyba na serveru [POST metoda přihlašování ]" }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
  }