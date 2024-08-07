import { prisma } from "@/app/database/db";

export async function handleLoginAttempt(userId) {
    try {
      // Step 1: Upsert the number of tries
      const numberOfTries = await prisma.numberOfTries.upsert({
        where: {
          userId: userId, // Check if a record with this userId exists
        },
        update: {
          // Increment the number of tries if the record exists
          number: { increment: 1 },
        },
        create: {
          // Create a new record with number of tries set to 1
          userId: userId,
          number: 1,
        },
      });
  
      // Step 2: Determine if a ban is needed
      const tries = numberOfTries.number;
      console.log("Počet pokusů:", tries);
  
      if (tries % 5 === 0 && tries >= 5) {
        // Determine the appropriate ban duration and new round
        let banDuration;
        let newRound;
  
        if (tries <= 5) {
          banDuration = 1; // 10 minutes
          newRound = 1;
        } else if (tries <= 10) {
          banDuration = 1; // 30 minutes
          newRound = 2;
        } else if (tries <= 15) {
          banDuration = 1440; // 24 hours
          newRound = 3;
        } else if (tries <= 20) {
          banDuration = 2880; // 48 hours
          newRound = 4;
        } else if (tries <= 25) {
          banDuration = 43200; // 1 month (30 days)
          newRound = 5;
        } else {
          banDuration = 43200; // 1 month (30 days)
          newRound = Math.ceil(tries / 5) + 5; // Increase round number
        }
  
        // Create a new ban record
        const bannedFrom = new Date();
        const additionalHours = 2; // Additional 2 hours
        const banDurationInMinutes = banDuration + (additionalHours * 60); // Convert additional hours to minutes and add to banDuration
        const bannedTill = new Date(bannedFrom.getTime() + banDurationInMinutes * 60000); // Convert total duration to milliseconds
  
        const ban = await prisma.bans.create({
          data: {
            userId: userId,
            reason: 'Mnoho neúspěšných pokusů o přihlášení',
            bannedFrom: bannedFrom,
            bannedTill: bannedTill,
            pernament: false, // Assuming the ban is temporary
          },
        });
  
        // Update the round in the numberOfTries table
        await prisma.numberOfTries.update({
          where: {
            userId: userId,
          },
          data: {
            round: newRound,
          },
        });
  
        console.log("Uživatel byl zablokován:", ban);
        return true;
      } else {
        console.log("Zatím není zablokován.");
        return false;
      }
    } catch (error) {
      console.error('Chyba při zpracování pokusů o přihlášení:', error);
      throw error; // Ensure errors are properly propagated
    }
  }

export async function resetUserTries(userId) {
    try {
      // Check if the record exists
      const existingRecord = await prisma.numberOfTries.findUnique({
        where: {
          userId: userId,
        },
      });
  
      if (existingRecord) {
        // Delete the existing record if it exists
        await prisma.numberOfTries.delete({
          where: {
            userId: userId,
          },
        });
  
        console.log("Počet pokusů byl smazán uživateli:", userId);
      } else {
        console.log("Záznam pro uživatele neexistuje, nic se nemění.");
      }
    } catch (error) {
      console.error('Chyba při resetování pokusů uživatele:', error);
      throw error; // Ensure errors are properly propagated
    }
  }
  