import { login } from "@/app/authentication/actions";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Kontrola formátu emailu
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ message: "Neplatný formát emailu." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const success = await login(email, password);
    if (success) {
      return new Response(JSON.stringify({ message: "Přihlášení úspěšné" }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ message: "Neplatné přihlašovací údaje" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error("Chyba při přihlašování:", error);

    let status = 500;
    let message = "Chyba na serveru";

    
    if (error.message === "Invalid credentials") {
      status = 401;
      message = "Neplatné přihlašovací údaje";
    }

    return new Response(JSON.stringify({ message }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}