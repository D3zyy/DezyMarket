import { logOut } from "../../authentication/actions";
import { DateTime } from "luxon";




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
            await prisma.create({ data: {
              info: `Chyba na /api/session - DELETE - (catch)  `,
              dateAndTime: dateAndTime,
              errorPrinted: error,
              userId: session?.userId,
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