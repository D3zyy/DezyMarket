import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { prisma } from '@/app/database/db';

dotenv.config();

export async function sendVerificationEmail(email) {
  const smtpServer = process.env.SMTP_SERVER;
  const port = parseInt(process.env.SMTP_PORT, 10);
  const senderEmail = process.env.EMAIL_USER;
  const password = process.env.EMAIL_PASS;

  // Generate a unique verification token
  const token = uuidv4();
  const hashedToken = await bcrypt.hash(token, 10);

  // Set the token expiration (e.g., 1 hour from now)
  const expirationDate = new Date(Date.now() + 3600000);

  // Czech time
  // Získání aktuálního času
const currentDate = new Date();

// Přidání jedné hodiny (3600000 ms)
const newDate = new Date(currentDate.getTime() + 3600000);

// Získání lokálního časového pásma (je třeba pro správnou časovou zónu)
const localOffset = newDate.getTimezoneOffset() * 60000;
const localISODate = new Date(newDate.getTime() - localOffset).toISOString();


 
  try {
    // Create the verification token record
    await prisma.VerificationTokens.create({
      data: {
        token: hashedToken,
        expiresAt: localISODate,
        user: {
          connect: { email }
        }
      }
    });

    // Create a transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: smtpServer,
      port: port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user: senderEmail,
        pass: password,
      },
    });

    // Set up email data
    const verificationLink =  `${process.env.NEXT_PUBLIC_BASE_URL}?token=${token}&email=${encodeURIComponent(email)}`;
    const mailOptions = {
      from: senderEmail,
      to: email,
      subject: 'Ověřte svoji emailovou adresu',
      text: `Prosím klikněte na odkaz níže pro ověření emailové adresy:\n\n${verificationLink}`,
      html: `<p>Prosím klikněte na odkaz níže pro ověření emailové adresy:</p><a href="${verificationLink}">Ověřit email</a>`,
    };

    // Send email
    let succ = await transporter.sendMail(mailOptions);


    return true;
  } catch (error) {
    console.error('Chyba při posílání emailu:', error);
    return false;
  }
}