import { prisma } from "../database/db";







export async function getUserAccountType(userId) {
  const currentDate = new Date();
  const localISODate = new Date(currentDate.getTime() - (currentDate.getTimezoneOffset() * 60000)).toISOString();

  try {
    // Fetch existing UserAccountType records
    const existingAccountTypes = await prisma.userAccountType.findMany({
      where: {
        userId: userId,
        OR: [
          {
            validTill: {
              gt: new Date(localISODate), // Ensure the accountType is still active
            },
          },
          {
            AccountType: {
              name: "Základní", // Include 'Základní' as a fallback
            },
          },
        ],
      },
      include: {
        AccountType: true, // Ensure that AccountType details are fetched
      },
      orderBy: [
        {
          validTill: 'desc', // Prioritize active records based on validTill
        },
        {
          AccountType: {
            name: 'asc', // Secondary sort to ensure 'Základní' is last if there are active records
          },
        },
      ],
    });

    // Define account type hierarchy
    const hierarchy = ['Legend', 'Premium', 'Základní'];

    // Function to get the index of the account type in the hierarchy
    const getAccountTypePriority = (name) => hierarchy.indexOf(name);

    let bestAccountType = null;

    if (existingAccountTypes.length > 0) {
      // Determine the best account type based on priority
      bestAccountType = existingAccountTypes.reduce((best, current) => {
        if (!best) return current;
        const bestPriority = getAccountTypePriority(best.AccountType.name);
        const currentPriority = getAccountTypePriority(current.AccountType.name);
        // Compare priorities
        return currentPriority < bestPriority ? current : best;
      }, null);    
      
    
      return bestAccountType.AccountType.name;
      
    } else {
      return ;
    }
  } catch (error) {
    console.error("Error handling user account type:", error);
    throw error; // Re-throw error to be handled by caller
  }
}

