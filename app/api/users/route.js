import { createSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
import bcrypt from 'bcrypt'; 
import { checkUserBan } from "../session/dbMethodsSession";
import { handleLoginAttempt, resetUserTries } from "./handleLoginAttempts";


// POST method for logging in
export async function POST(req) {

  try {
    // Attempt to parse the request body
    let data;
    try {
      data = await req.json();
      
    } catch (error) {
      return new Response(JSON.stringify({ message: "Chybně formátovaný požadavek." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { email, password } = data;
    const plainPassword = password
    // Check if both email and password are provided
    if (!email || !password) {
      return new Response(JSON.stringify({ message: "Údaje nebyly nalezeny." }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Check format of email on server
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ message: "Neplatný formát emailu." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Find the user in the database
    const user = await prisma.Users.findUnique({
      where: {
        email: email,
      },
    });

    // Check validity of the password and ban status
    let isPasswordValid = false;
    let ban = false;
    let messageBan = false;
    
    if (user) {
      


      isPasswordValid = await bcrypt.compare(password, user.password);
      ban = await checkUserBan(user.id);

   

      if(user && !ban && !isPasswordValid ){
       await handleLoginAttempt(user.id);
      }
    
      
   
      if (ban.pernament) {
        if(ban.reason == null){
          messageBan = `Váš účet byl trvale zablokován. Pokud si myslíte, že došlo k omylu, kontaktujte nás prosím.`;
        } else{
          messageBan = `Váš účet byl trvale zablokován z důvodu: ${ban.reason}. Pokud si myslíte, že došlo k omylu, kontaktujte nás prosím.`;
        }
      
      } else {
        if(ban.reason == null){
          messageBan = `Účet byl zablokován do: ${ban.banTill}. Pokud si myslíte, že došlo k omylu, kontaktujte nás prosím.`;
        } else {
          messageBan = `Účet byl zablokován do: ${ban.banTill} z důvodu: ${ban.reason}.  Pokud si myslíte, že došlo k omylu, kontaktujte nás prosím.`;
        }
    
      
      }

    
    }

    if (user && isPasswordValid && !ban) {
      if(user.verifiedEmail === false){
        return new Response(JSON.stringify({ message: "Email nebyl ověřen." }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      

     

      await resetUserTries(user.id)
      await createSession(user,plainPassword);
      return new Response(JSON.stringify({ message: "Přihlášení úspěšné"}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else if (user && ban) {
      return new Response(JSON.stringify({ message: messageBan }), {
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

    return new Response(JSON.stringify({ message: "Chyba na serveru" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }finally {
    await prisma.$disconnect(); // Uzavřete připojení po dokončení
}
}