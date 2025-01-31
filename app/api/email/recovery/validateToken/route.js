import bcrypt from 'bcrypt';
import { prisma } from '@/app/database/db';
import { z } from 'zod';
import { DateTime } from 'luxon';

export async function POST(req) {
  try {
    const { token, newPassword } = await req.json();
    
    if (!token || !newPassword) {
      return new Response(
        JSON.stringify({ message: 'Token a nové heslo jsou povinné.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const schema = z.object({
      password: z.string()
        .max(40, 'Heslo může mít maximálně 40 znaků')
        .min(6, 'Heslo musí mít alespoň 6 znaků')
        .regex(/[A-Z]/, 'Heslo musí obsahovat alespoň jedno velké písmeno')
        .regex(/[a-z]/, 'Heslo musí obsahovat alespoň jedno malé písmeno')
        .regex(/\d/, 'Heslo musí obsahovat alespoň jedno číslo'),
    });

    const validatedFields = schema.safeParse({
      password: newPassword,
    });
  
    // Retrieve the token record from the database using the token
    const tokenRecord = await prisma.VerificationTokens.findFirst({
      where: { token: token },
      include: { user: true }
    });
   
    // Check if the token record exists
    if (!tokenRecord) {
      let { token, newPassword } = await req.json();
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
                await prisma.errors.create({
                  info: `Chyba na /api/email/recovery/validateToken - POST - (odkaz je neplatný) token: ${token} newPassword: ${newPassword} `,
                  dateAndTime: dateAndTime,
                  userId: session?.userId,
                  ipAddress:ip,
                })
      return new Response(
        JSON.stringify({ message: 'Odkaz je neplatný.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!validatedFields.success) {
      return new Response(
        JSON.stringify({ message: JSON.stringify(validatedFields.error.flatten().fieldErrors) }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    const currentDate = new Date();
    const newDate = new Date(currentDate.getTime());

    // Získání lokálního časového pásma (je třeba pro správnou časovou zónu)
    const localOffset = newDate.getTimezoneOffset() * 60000;
    const localISODate = new Date(newDate.getTime() - localOffset).toISOString();
   

    if (localISODate > tokenRecord.expiresAt) {
      let { token, newPassword } = await req.json();
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
                await prisma.errors.create({
                  info: `Chyba na /api/email/recovery/validateToken - POST - (odkaz již vypršel) token: ${token} newPassword: ${newPassword} `,
                  dateAndTime: dateAndTime,
                  userId: session?.userId,
                  ipAddress:ip,
                })
      return new Response(
        JSON.stringify({ message: 'Odkaz již vypršel' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify the token against the hashed token in the database
    const isMatch = token === tokenRecord.token;

    if (isMatch) {
      // Token is valid, update the user's password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.Users.update({
        where: { id: tokenRecord.userId },
        data: { password: hashedPassword }
      });

      // Clean up the used token
      await prisma.VerificationTokens.delete({
        where: { id: tokenRecord.id }
      });

      return new Response(
        JSON.stringify({ message: 'Heslo bylo úspěšně změněno.', success: true }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } else {
      let { token, newPassword } = await req.json();
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
                await prisma.errors.create({
                  info: `Chyba na /api/email/recovery/validateToken - POST - (odkaz je neplatný) token: ${token} newPassword: ${newPassword} `,
                  dateAndTime: dateAndTime,
                  userId: session?.userId,
                  ipAddress:ip,
                })
      return new Response(
        JSON.stringify({ message: 'Odkaz je neplatný.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    try{
      let { token, newPassword } = await req.json();
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
                await prisma.errors.create({
                  info: `Chyba na /api/email/recovery/validateToken - POST - (catch) token: ${token} newPassword: ${newPassword} `,
                  dateAndTime: dateAndTime,
                  errorPrinted: error,
                  userId: session?.userId,
                  ipAddress:ip,
                })
    
              }catch(error){}


    console.error('Chyba při ověřování tokenu:', error.message);
    return new Response(
      JSON.stringify({ message: 'Chyba při ověřování tokenu.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } finally {
    await prisma.$disconnect(); // Uzavřete připojení po dokončení
  }
}