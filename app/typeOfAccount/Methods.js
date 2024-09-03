import { prisma } from "../database/db";
import { getSession } from "../authentication/actions";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)


export async function getUserAccountTypeOnStripe(email) {
  try {
    if(!email){
      return;
    }

    // Najdeme zákazníka na základě e-mailu
    const customers = await stripe.customers.list({
      email: email,
      limit: 1, // Omezíme na jeden výsledek, protože e-mail by měl být unikátní
    });

    // Zkontrolujeme, zda zákazník existuje
    if (!customers.data.length) {
    //  console.log(`Zákazník s e-mailem ${email} nebyl nalezen.`);
      return null;
    }

    const customer = customers.data[0];

    // Najdeme aktivní předplatná pro zákazníka
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1, // Pokud chceme pouze první aktivní předplatné
    });

    // Zkontrolujeme, zda existuje aktivní předplatné
    if (!subscriptions.data.length) {
      const userAccountTypes = await prisma.users.findUnique({
        where: {
          email: email, 
        },
        select: {
          accountTypes: {
            select: {
              name: true, 
            },
          },
        },
      });
      
      // Log the account type names
      if (userAccountTypes && userAccountTypes.accountTypes.length > 0) {
        // Return the name of the first (and only) account type
        return userAccountTypes.accountTypes[0].name;
      } else {
        return null; // Or handle this case as needed, e.g., throw an error or return a default value
      }
     // console.log(`Žádné aktivní předplatné pro zákazníka ${email} nebylo nalezeno.`);
      return null;
    }

    const subscription = subscriptions.data[0];

    // Získáme informace o předplatném a produktu
    const subscriptionInfo = await stripe.subscriptions.retrieve(subscription.id);
    const product = await stripe.products.retrieve(subscriptionInfo.plan.product);


    return product.name;

  } catch (error) {
    console.error("Chyba při získávání typu účtu ze Stripe:", error);
    throw error; // Re-throw error to be handled by caller
  }
}


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

