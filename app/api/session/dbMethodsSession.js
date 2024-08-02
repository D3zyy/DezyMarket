import { prisma } from "@/app/database/db";

export const checkUserBan = async (userId) => {
  try {
    const currentDate = new Date();
    // Find the active ban for the user, if any
    const activeBan = await prisma.bans.findFirst({
      where: {
        userId: userId,
        bannedTill: {
          gt: currentDate, // Ensure the ban is still active
        },
      },
      select: {
        bannedTill: true,
        pernament: true,
      },
      orderBy: {
        bannedTill: 'desc', // Get the most recent ban if there are multiple
      },
    });

    if (activeBan) {
      const banTill = activeBan.bannedTill.toLocaleString('cs-CZ', { timeZone: 'Europe/Prague' });
 
      return {
        banTill,
        pernament: activeBan.pernament,
      };
    } else {
      console.log('Uživatel není zabanován');
      return false;
    }
  } catch (error) {
    console.error('Chyba kontrolovaní banu uživatele:', error);
    throw error;
  }
};