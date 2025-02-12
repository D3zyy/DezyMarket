import { createSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
import bcrypt from 'bcrypt'; 
import { checkUserBan } from "../session/dbMethodsSession";
import { handleLoginAttempt, resetUserTries } from "./handleLoginAttempts";
import { checkRateLimit } from "@/app/RateLimiter/rateLimit";
import { getCachedData } from "@/app/getSetCachedData/caching";
// POST method for logging in
export async function POST(req) {


  let data;
  try {
   const ipToRedis =
    req.headers.get("x-forwarded-for")?.split(",")[0] || 
    req.headers.get("x-real-ip") ||                     
                                                    null;
                                          
                                                  const ipCheck = ipToRedis?.startsWith("::ffff:") ? ipToRedis.replace("::ffff:", "") : ipToRedis;
                                              const rateLimitStatus = await checkRateLimit(ipCheck);
                                          
                                              if (!rateLimitStatus.allowed) {
                                                  return new Response(JSON.stringify({
                                                      message: "Příliš mnoho požadavků"
                                                  }), {
                                                      status: 403,
                                                      headers: { 'Content-Type': 'application/json' }
                                                  });
                                              }
    // Attempt to parse the request body
  
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
    

 const user = await getCachedData(`userEmail_${email}`, () => prisma.users.findFirst({
    where: { email: email}
    }), 600)


    // Check validity of the password and ban status
    let isPasswordValid = false;
    let ban = false;
    let messageBan = false;
    
    if (user) {
      


      isPasswordValid = await bcrypt.compare(password, user.password);
      ban = await checkUserBan(user.id);

   

     // if(user && !ban && !isPasswordValid ){
       //await handleLoginAttempt(user.id);
      //}
    
      
   
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
      

     
      const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      req.headers.get("x-real-ip") ||                      // Alternativní hlavička
      req.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
    console.log("IP adresa :", ip);
    
    // Validace IP adresy (pro jistotu)
    //if (!ip || !/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){2}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip)) {
    //  throw new Error("Invalid IP address");
  //  }
    
    // Najít existující IP adresu v databázi
    let ipToRegister = await prisma.ipAddresses.findFirst({
      where: { value: ip },
    });
    
    if (!ipToRegister) {
      // Pokud IP adresa neexistuje, vytvoříme ji
      ipToRegister = await prisma.ipAddresses.create({
        data: { value: ip },
      });
    }
    
    // Zkontrolovat, zda uživatel již má tuto IP přiřazenou
    const ipToRegisterAlreadyExistWithThatUser = await prisma.ipAddressesOnUsers.findFirst({
      where: {
        ipAddressId: ipToRegister.id,
        userId: user.id,
      },
    });
    
    if (!ipToRegisterAlreadyExistWithThatUser) {
      // Vytvoříme relaci mezi IP adresou a uživatelem, pokud neexistuje
      await prisma.ipAddressesOnUsers.create({
        data: {
          ipAddressId: ipToRegister.id,
          userId: user.id,
          usedForLogin: 1
        },
      });
    } else {
      await prisma.ipAddressesOnUsers.update({
        where: {
          id: ipToRegisterAlreadyExistWithThatUser.id, // Use the unique ID of the record
        },
        data: {
          usedForLogin: ipToRegisterAlreadyExistWithThatUser.usedForLogin + 1,
        },
      });
      
    }

    console.log("Již exstuje ip adresa :",ipToRegister)
    console.log("Již má uživatel tuto ip adresu",ipToRegisterAlreadyExistWithThatUser)
//      await resetUserTries(user.id)
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
    try{
                  
       
          const rawIp =
          req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
          req.headers.get("x-real-ip") ||                      // Alternativní hlavička
          req.socket?.remoteAddress ||                         // Lokální fallback
          null;
        
        // Odstranění případného prefixu ::ffff:
        const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
        
      
        
              const dateAndTime = DateTime.now()
              .setZone('Europe/Prague')
              .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
                await prisma.errors.create({ data: {
                  info: `Chyba na /api/users - POST - (catch)data: ${data}  `,
                  dateAndTime: dateAndTime,
                  errorPrinted: error,
                  ipAddress:ip },
                })
    
              }catch(error){}
    console.error("Chyba ze strany serveru:", error);

    return new Response(JSON.stringify({ message: "Chyba na serveru" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }finally {
    await prisma.$disconnect(); // Uzavřete připojení po dokončení
}
}