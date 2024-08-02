import { createSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
import { verifyUserCredentials } from "./dbMethodsUsers";
import bcrypt from 'bcrypt'; 
import { checkUserBan } from "../session/dbMethodsSession";
// POST method for logging in
export async function POST(req) {

  try {
    const { email, password } = await req.json();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // check format of email on server
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ message: "Neplatný formát emailu." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    // find the user in the db
    const user = await prisma.Users.findUnique({
      where: {
        email: email,
      },
    });
 
    // check validity of his password
    let  isPasswordValid = false
    let banTill = false
    if(user){
      console.log(user.password)
      console.log(password)
      console.log(user.id)
      isPasswordValid = await bcrypt.compare(password, user.password);
      banTill = await checkUserBan(user.userId)
    }


    
    if (user && isPasswordValid && !banTill) {
       await createSession(user.id);
      return new Response(JSON.stringify({ message: "Přihlášení úspěšné" }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else if (user && isPasswordValid && banTill){
      return new Response(JSON.stringify({ message: `Uživatel zabanován do: ${banTill}`}), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    else {
      return new Response(JSON.stringify({ message: "Neplatné přihlašovací údaje" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error("Chyba ze strany serveru:", error);

    let status = 500;
    let message = "Chyba na serveru";


    return new Response(JSON.stringify({ message }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}