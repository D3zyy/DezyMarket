import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ message: 'Email je povinný.' }), { status: 400 });
    }

    // Kontrola existence emailu v databázi
    const user = await prisma.Users.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ message: 'Tento email není registrován.' }), { status: 404 });
    }

    // Konfigurace Nodemailer
    const smtpServer = process.env.SMTP_SERVER;
    const port = parseInt(process.env.SMTP_PORT, 10);
    const senderEmail = process.env.EMAIL_USER;
    const password = process.env.EMAIL_PASS;

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
      text: 'Toto je váš odkaz pro obnovení hesla: https://example.com/reset-password?token=your-token',
    };

    // Odeslání emailu
    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ message: 'Pokyny k obnovení hesla byly odeslány na váš email.' }), { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(JSON.stringify({ message: 'Nastala chyba při odesílání požadavku na obnovení hesla.' }), { status: 500 });
  }
}