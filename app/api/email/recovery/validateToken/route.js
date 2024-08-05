import bcrypt from 'bcrypt';
import { prisma } from '@/app/database/db';

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
    console.log("token ktery sem ziskal :" , token)
   

    // Retrieve the token record from the database using the token
    const tokenRecord = await prisma.VerificationTokens.findFirst({
      where: { token: token },
      include: { user: true }
    });
    console.log(tokenRecord)
    // Check if the token record exists
    if (!tokenRecord) {
      return new Response(
        JSON.stringify({ message: 'Ověření je neplatné.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const currentDate = new Date();
    const expirationDate = new Date(tokenRecord.expiresAt);
    expirationDate.setTime(expirationDate.getTime() - 7200000);
    console.log(currentDate)
    console.log(expirationDate)
    if (currentDate > expirationDate) {
    
        return new Response(
            JSON.stringify({ message: 'Ověření již vypršelo.' }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            }
          );
    }
    // Verify the token against the hashed token in the database
    const isMatch = token === tokenRecord.token

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
        JSON.stringify({ message: 'Heslo bylo úspěšně změněno.' , success: true}),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } else {
      return new Response(
        JSON.stringify({ message: 'Ověření je neplatné.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Chyba při ověřování tokenu:', error.message);
    return new Response(
      JSON.stringify({ message: 'Chyba při ověřování tokenu.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}