import { prisma } from "@/app/database/db";

export const checkUserBan = async (userId) => {
  try {
    const currentDate = new Date();
    const localISODate = new Date(currentDate.getTime() - (currentDate.getTimezoneOffset() * 60000)).toISOString();

    // Find the active ban for the user, if any
    const activeBans = await prisma.bans.findMany({
      where: {
        userId: userId,
        OR: [
          {
            bannedTill: {
              gt: localISODate, // Ensure the ban is still active
            },
          },
          {
            pernament: true, // Include permanent bans
          },
        ],
      },
      select: {
        bannedTill: true,
        pernament: true,
        reason: true,
      },
      orderBy: {
        bannedTill: 'desc', // Get the most recent ban if there are multiple
      },
    });

    if (activeBans.length > 0) {
      // Check if there is a permanent ban
      const permanentBan = activeBans.find(ban => ban.pernament);
 
      if (permanentBan) {
        return {
          banTill: 'trvale',
          pernament: true,
          reason: permanentBan.reason,
        };
      }

      // If no permanent ban, get the most recent time-based ban
      const recentBan = activeBans[0];
      const dbDate = new Date(recentBan.bannedTill);
      const localDate = new Date(dbDate.getTime() + (dbDate.getTimezoneOffset() * 60000));
      const banTill = localDate.toLocaleString('cs-CZ');
      return {
        banTill,
        pernament: false,
        reason: recentBan.reason,
      };
    } else {
      return false;
    }
  } catch (error) {
    console.error('Chyba kontrolovaní banu uživatele:', error);
    throw error;
  }
};