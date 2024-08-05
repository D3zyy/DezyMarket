import bcrypt from 'bcrypt';
import { prisma } from '@/app/database/db';

export async function verifyToken(email, token) {
  try {
    // Retrieve the token record from the database using the email
    const tokenRecord = await prisma.VerificationTokens.findFirst({
      where: { user: { email } },
      include: { user: true }
    });

    // Check if the token record exists
    if (!tokenRecord) {
      console.log("token nebyl nalezen");
      return { message: 'Ověření je neplatné.', success: false };
    }

    // Check if the token has expired
    const currentDate = new Date();
    const expirationDate = new Date(tokenRecord.expiresAt);
    
    // Odečtěte 2 hodiny (7200000 ms) od času vypršení
    expirationDate.setTime(expirationDate.getTime() - 7200000);
    
    console.log("čas teď:", currentDate.toLocaleString('cs-CZ'));
    console.log("čas vypršení upravený:", expirationDate.toLocaleString('cs-CZ'));
    
    if (currentDate > expirationDate) {
      console.log("token vypršel");
      return { message: 'Ověření již vypršelo.', success: false };
    }

    // Verify the token against the hashed token in the database
    const isMatch = await bcrypt.compare(token, tokenRecord.token);

    if (isMatch) {
      // Token is valid, update user to mark email as verified
      await prisma.users.update({
        where: { id: tokenRecord.userId },
        data: { verifiedEmail: true }
      });

      // Clean up the used token
      await prisma.verificationTokens.delete({
        where: { id: tokenRecord.id }
      });

      console.log("token byl úspěšně ověřen");
      return { message: 'Email byl úspěšně ověřen.', success: true };
    } else {
      console.log("token je neplatný");
      return { message: 'Token je neplatné.', success: false };
    }
  } catch (error) {
    // Log only critical errors
    console.error('Chyba při ověřování tokenu:', error.message);
    return { message: 'Chyba při ověřování tokenu.', success: false };
  }
}