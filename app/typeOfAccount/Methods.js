import { prisma } from "../database/db";
import { getSession } from "../authentication/actions";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function getUserAccountTypeOnStripe(email) {
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
        limit: 1, // Get only the first active subscription
      });

      // Check if there is an active subscription
      if (subscriptions.data.length > 0) {
        const subscription = subscriptions.data[0];
        return subscription.plan.product.name; // Return the product name
      }
    }

    // If no active subscription is found, check local database
    let userAccountTypes = null;
    try {
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
    } catch (error) {
      console.error("Error fetching account types from database:", error);
    } finally {
      await prisma.$disconnect(); // Close the connection after finishing
    }

    // Return the account type from the local database if found
    if (userAccountTypes && userAccountTypes.accountTypes.length > 0) {
      return userAccountTypes.accountTypes[0].name;
    } else {
      return null; // No account type found in the local database
    }

  } catch (error) {
    console.error("Chyba při získávání typu účtu ze Stripe:", error);
    throw error; // Re-throw error to be handled by caller
  }
}