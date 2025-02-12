import { logOut } from "../../authentication/actions";
import { DateTime } from "luxon";
import { checkRateLimit } from "@/app/RateLimiter/rateLimit";



export async function DELETE(req) {
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
    // Call logOut and handle its response
    const { success, message, status } = await logOut(req);
   
    // Return the appropriate response
    return new Response(JSON.stringify({  message }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });

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
              info: `Chyba na /api/session - DELETE - (catch)  `,
              dateAndTime: dateAndTime,
              errorPrinted: error,
              ipAddress:ip },
            })

          }catch(error){}
    console.error("Chyba níčení session:", error);

    // Return a 500 Internal Server Error response on exception
    return new Response(JSON.stringify({ message: "Chyba na serveru [DELETE metoda session]" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}