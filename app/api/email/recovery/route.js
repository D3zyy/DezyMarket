import bcrypt from 'bcrypt';
import { prisma } from '@/app/database/db';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { DateTime } from 'luxon';

const smtpServer = process.env.SMTP_SERVER;
const port = parseInt(process.env.SMTP_PORT, 10);
const senderEmail = process.env.EMAIL_USER;
const password = process.env.EMAIL_PASS;
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL; 

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ message: 'Email je povinný.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Kontrola existence emailu v databázi
    const user = await prisma.Users.findUnique({
      where: { email: email },
    });

    if (!user) {
      return new Response(
        JSON.stringify({ message: 'Pokyny k obnovení hesla byly odeslány, pokud je e-mail registrován.' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Kontrola, zda je email ověřený
    if (!user.verifiedEmail) {
      let { email } = await req.json();
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
              info: `Chyba na /api/email/recovery - POST - (Váš email není ověřen. Ověřte svůj email, než budete moci obnovit heslo.) email: ${email} `,
              dateAndTime: dateAndTime,
              errorPrinted: error,
              userId: session?.userId,
              ipAddress:ip,
            })
      return new Response(
        JSON.stringify({ message: 'Váš email není ověřen. Ověřte svůj email, než budete moci obnovit heslo.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Odstranění starých tokenů pro tohoto uživatele (pokud existují)
    await prisma.VerificationTokens.deleteMany({
      where: { userId: user.id },
    });

    // Vygenerování tokenu a jeho uložení do databáze
    const token = uuidv4();

    const currentDate = new Date();

    const newDate = new Date(currentDate.getTime() + 600000);

     // Získání lokálního časového pásma (je třeba pro správnou časovou zónu)
    const localOffset = newDate.getTimezoneOffset() * 60000;
    const localISODate = new Date(newDate.getTime() - localOffset).toISOString();
  
    await prisma.VerificationTokens.create({
      data: {
        token: token,
        userId: user.id,
        expiresAt: localISODate,
      },
    });

    // Konfigurace Nodemailer
    const transporter = nodemailer.createTransport({
      host: smtpServer,
      port: port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user: senderEmail,
        pass: password,
      },
    });

    // Příprava emailu
    const mailOptions = {
      from: senderEmail,
      to: email,
      subject: 'Obnovení hesla',
      text: `Toto je váš odkaz pro obnovení hesla: ${baseUrl}/reset-password?token=${token}`,
    };

    // Odeslání emailu
    await transporter.sendMail(mailOptions);

    return new Response(
      JSON.stringify({ message: 'Pokyny k obnovení hesla byly odeslány, pokud je e-mail registrován.' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    try{
      let { email } = await req.json();
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
                      info: `Chyba na /api/email/recovery - POST - (catch) email: ${email} `,
                      dateAndTime: dateAndTime,
                      errorPrinted: error,
                      userId: session?.userId,
                      ipAddress:ip,
                    })
        
                  }catch(error){}
    
    console.error('Chyba při odesílání emailu:', error);
    return new Response(
      JSON.stringify({ message: 'Nastala chyba při odesílání požadavku na obnovení hesla.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }finally {
    await prisma.$disconnect(); // Uzavřete připojení po dokončení
}
}