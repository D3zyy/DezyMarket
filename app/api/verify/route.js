import { verifyToken } from "../email/verifyToken";
import { checkRateLimit } from "@/app/RateLimiter/rateLimit";
export async function GET(req) {
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
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  // Check if email and token are provided
  if (!email || !token) {
 
    return new Response(
      JSON.stringify({ message: 'Email nebo token chybý.', success: false }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {

    // Call the verifyToken function

    const result = await verifyToken(email, token);
      

    // Return JSON response with appropriate status
    return new Response(
      JSON.stringify(result),
      {
        status: result.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
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
              info: `Chyba na /api/verify - GET - (catch) token: ${token} email: ${email}  `,
              dateAndTime: dateAndTime,
              errorPrinted: error,
              ipAddress:ip },
            })

          }catch(error){}
    // Handle errors
    console.error('Error during token verification:', error);
    return new Response(
      JSON.stringify({ message: 'Internal Server Error', success: false }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}