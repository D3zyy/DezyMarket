import { prisma } from "../database/db";
import { getSession } from "../authentication/actions";
import { DateTime } from 'luxon';
import { select } from "@nextui-org/react";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function getUserAccountTypeFromDb(email) {
  try {
    if (!email) {
      return null;
    }

    // Fetch customers with the given email from Stripe
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    // Check if customer exists
    if (customers.data.length > 0) {
      const customer = customers.data[0];

      // Fetch subscriptions for the customer with expanded product details
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        expand: ['data.plan.product'],
       
      });
      let namesToReturn = [];
      let zakladniFound = false;
      
      for (const subscription of subscriptions.data) {
          const productName = subscription.plan.product.name;
      
          if (productName === "Základní") {
              zakladniFound = true;
          } else {
              namesToReturn.push(productName);
          }
          
      }
      
      // Logika vrácení hodnot
      if (namesToReturn.length === 0 && zakladniFound) {
          // Pokud je pouze jedno předplatné "Základní"
          namesToReturn.push("Základní");
      } else if (zakladniFound && namesToReturn.length === 1) {
          // Pokud je jedno "Základní" a jedno jiné, necháme pouze jiné
          // `namesToReturn` již obsahuje jiné, takže nic nemusíme dělat
      } else if (zakladniFound && namesToReturn.length > 1) {
          // Pokud existují dvě různá předplatná, zachováme je obě
          namesToReturn.push("Základní");
          
      }
      
      console.log("Názvy k vrácení: ", namesToReturn);

      // Check if there is an active subscription
      if (subscriptions.data.length > 0) {
        const subscription = subscriptions.data[0];
        return namesToReturn; // Return the product name
      }
    }

    // If no active subscription is found, check local database
    let userAccountTypes = null;
    
      userAccountTypes = await prisma.users.findUnique({
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
   

    // Return the account type from the local database if found
    if (userAccountTypes && userAccountTypes.accountTypes.length > 0) {
      return userAccountTypes.accountTypes[0].name;
    } else {
      return null; // No account type found in the local database
    }

  } catch (error) {
    console.error("Chyba při získávání typu účtu ze Stripe:", error);
    throw error; // Re-throw error to be handled by caller
  }finally {
    await prisma.$disconnect(); // Uzavřete připojení po dokončení
}
}


const DateAndTimeNowPrague = DateTime.now()
  .setZone('Europe/Prague')
  .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");


  export async function getTypeOfAccountDetails() {
    try {
      // Získání AccountType s připojenými perkami a cenami
      const accountTypes = await prisma.accountType.findMany({
        include: {
          perks: true,
          accPrices: {
            include: {
              price: true,
            },
          },
        },
      });
  
      // Mapování výsledků pro každého accountType
      const result = accountTypes.map(accountType => {
        // Najdi aktivní cenu
        const activePrice = accountType.accPrices.find(accPrice => {
          // Pokud `activeTo` je null, znamená, že cena je stále aktivní.
          const activeFrom = DateTime.fromJSDate(accPrice.activeFrom);
          const activeTo = accPrice.activeTo ? DateTime.fromJSDate(accPrice.activeTo) : null;
  
          const now = DateTime.fromISO(DateAndTimeNowPrague);
  
          // Cena je aktivní, pokud je aktivní od `activeFrom` a aktuální datum je mezi activeFrom a activeTo (nebo `activeTo` je null)
          return activeFrom <= now && (activeTo === null || activeTo >= now);
        });
  
        return {
          id: accountType.id,
          name: accountType.name,
          emoji: accountType.emoji,
          priority: accountType.priority,
          perks: accountType.perks.map(perk => ({
            id: perk.id,
            name: perk.name,
            valid: perk.valid,
          })),
          accPrices: accountType.accPrices.map(accPrice => ({
            priceId: accPrice.priceId,
            priceValue: accPrice.price.value,
            priceCode: accPrice.price.priceCode,
            activeFrom: accPrice.activeFrom,
            activeTo: accPrice.activeTo,
          })),
          activePrice: activePrice ? activePrice.price.value : null, // Pokud je cena aktivní
        };
      });
  
      // Vráti výsledek jako JSON
      return JSON.stringify(result, null, 2);
    } catch (error) {
      console.error('Error retrieving account types with active prices and perks:', error);
      return null;
    }finally {
      await prisma.$disconnect(); // Uzavřete připojení po dokončení
  }
  }



export async function getUserAccountTypeOnStripe(email) {
  try {
    if (!email) {
      return null;
    }

    // Získejte aktuální čas v zóně Praha
    const DateAndTimeNowPrague = DateTime.now()
  .setZone('Europe/Prague')
  .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");

// Načtěte typy účtů uživatele z databáze a filtrujte pouze aktivní účty
const userAccountTypes = await prisma.users.findUnique({
  where: {
    email: email, // Filter by user email
  },
  select: {
    accounts: {
      where: {
        active: true, // Filter only active accounts
        fromDate: {
          lte: DateAndTimeNowPrague, // Ensure fromDate <= current date
        },
        OR: [
          {
            toDate: {
              gte: DateAndTimeNowPrague, // toDate >= current date
            },
          },
          {
            toDate: null, // toDate is not set
          },
        ],
      },
      select: {
        price: true,
         
       
        fromDate: true,
        toDate: true,
        monthIn: true,
        gifted: true,
        scheduleToCancel: true,
        accountType: {
          select: {
            priority: true,
            name: true, // Access the 'name' field in the 'accountType' table
          },
        },
      },
    },
  },
});


  
    // Zkontrolujte, zda existují nějaké účty
    if (userAccountTypes && userAccountTypes.accounts && userAccountTypes.accounts.length > 0) {
      // Seřaďte účty podle priority sestupně
      const sortedAccounts = userAccountTypes.accounts.sort((a, b) => b.accountType.priority - a.accountType.priority);
    
      sortedAccounts[0].accountType.monthIn = sortedAccounts[0].monthIn;
      sortedAccounts[0].accountType.scheduleToCancel = sortedAccounts[0].scheduleToCancel;
      sortedAccounts[0].accountType.fromDate = sortedAccounts[0].fromDate;
      sortedAccounts[0].accountType.price = sortedAccounts[0]?.price?.value;
      sortedAccounts[0].accountType.toDate = sortedAccounts[0].toDate;
      sortedAccounts[0].accountType.gifted = sortedAccounts[0].gifted;
      console.log(sortedAccounts[0].accountType)
      return sortedAccounts[0].accountType;  // Vraťte název účtu s nejvyšší prioritou
    } else {
      return null; // Žádný odpovídající účet nenalezen
    }
  } catch (error) {
    console.error("Chyba při získávání typu účtu z databáze:", error);
    throw error; // Předejte chybu volajícímu
  } finally {
    await prisma.$disconnect(); // Uzavřete připojení k databázi
  }
}





export async function getTypeOfTops() {
  try {
    // Získání AccountType s připojenými perkami a cenami
    const accountTypes = await prisma.Tops.findMany({});

    // Mapování výsledků pro každého accountType
    const result = accountTypes.map(accountType => {
      // Najdi aktivní cenu
      const activePrice = accountType.accPrices.find(accPrice => {
        // Pokud `activeTo` je null, znamená, že cena je stále aktivní.
        const activeFrom = DateTime.fromJSDate(accPrice.activeFrom);
        const activeTo = accPrice.activeTo ? DateTime.fromJSDate(accPrice.activeTo) : null;

        const now = DateTime.fromISO(DateAndTimeNowPrague);

        // Cena je aktivní, pokud je aktivní od `activeFrom` a aktuální datum je mezi activeFrom a activeTo (nebo `activeTo` je null)
        return activeFrom <= now && (activeTo === null || activeTo >= now);
      });

      return {
        id: accountType.id,
        name: accountType.name,
        emoji: accountType.emoji,
        priority: accountType.priority,
        perks: accountType.perks.map(perk => ({
          id: perk.id,
          name: perk.name,
          valid: perk.valid,
        })),
        accPrices: accountType.accPrices.map(accPrice => ({
          priceId: accPrice.priceId,
          priceValue: accPrice.price.value,
          priceCode: accPrice.price.priceCode,
          activeFrom: accPrice.activeFrom,
          activeTo: accPrice.activeTo,
        })),
        activePrice: activePrice ? activePrice.price.value : null, // Pokud je cena aktivní
      };
    });

    // Vráti výsledek jako JSON
    return JSON.stringify(result, null, 2);
  } catch (error) {
    console.error('Error retrieving account types with active prices and perks:', error);
    return null;
  }finally {
    await prisma.$disconnect(); // Uzavřete připojení po dokončení
}
}