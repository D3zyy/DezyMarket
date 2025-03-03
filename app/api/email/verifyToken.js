import bcrypt from 'bcrypt';
import { prisma } from '@/app/database/db';
import { DateTime } from 'luxon';
import { getCachedData } from '@/app/getSetCachedData/caching';

export async function verifyToken(email, token) {
    try {
        // Retrieve the token record from the database using the email
        const tokenRecord = await prisma.VerificationTokens.findFirst({
            where: { user: { email } },
            include: { user: true }
        });

 const user = prisma.users.findFirst({
    where: { email: email }
    })
        // Check if the token record exists
        if (!tokenRecord) {
            if (user) {
                if (user.verifiedEmail === true) {
                    return { message: 'Email byl již ověřen.', success: true };
                }
            }

            return { message: 'Odkaz je neplatný.', success: false };
        }

        const currentDate = new Date();
        const newDate = new Date(currentDate.getTime());
    
        // Získání lokálního časového pásma (je třeba pro správnou časovou zónu)
        const localOffset = newDate.getTimezoneOffset() * 60000;
        const localISODate = new Date(newDate.getTime() - localOffset).toISOString();

  

        if (localISODate > tokenRecord.expiresAt) {
            return { message: 'Odkaz již vypršel.', success: false };
        }

        // Verify the token against the hashed token in the database
        const isMatch = await bcrypt.compare(token, tokenRecord.token);

        if (isMatch) {
            // Token is valid, update user to mark email as verified
            await prisma.Users.update({
                where: { id: tokenRecord.userId },
                data: { verifiedEmail: true }
            });

            // Clean up the used token
            await prisma.VerificationTokens.delete({
                where: { id: tokenRecord.id }
            });


            // Adding customer to Stripe
            const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
            const userFromDb = await  prisma.users.findFirst({
                where: { email: email }
                })

            const customer = await stripe.customers.create({
                email: email,
                name: userFromDb.fullName
            });

            return { message: 'Email byl úspěšně ověřen.', success: true };
        } else {
            return { message: 'Odkaz je neplatný.', success: false };
        }
    } catch (error) {
        console.log(error)
         try{                
                              const dateAndTime = DateTime.now()
                              .setZone('Europe/Prague')
                              .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
                                await prisma.errors.create({
                                    data:{
                                  info: `Chyba na /api/email/verifyToken.js - (catch) email: ${email} ${token} `,
                                  dateAndTime: dateAndTime,
                                  errorPrinted: error,
                                    }
                                })
                    
                              }catch(error){}

        return { message: 'Chyba při ověřování emailu.', success: false };
    } finally {
        await prisma.$disconnect(); // Uzavřete připojení po dokončení

    }
}