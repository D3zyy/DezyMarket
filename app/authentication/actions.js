"use server";
import { v4 as uuidv4 } from 'uuid'; 
import { sessionOptions, sessionData, defaultSession } from "./lib"
import {  getIronSession } from "iron-session"
import { cookies } from "next/headers"
import { prisma } from '../database/db';
import { checkUserBan } from '../api/session/dbMethodsSession';
import { getUserAccountTypeOnStripe } from '../typeOfAccount/Methods';

export const getSession = async () => {
  try {
    // Retrieve the session using iron-session
    const session = await getIronSession(cookies(), sessionOptions);

    if (session && session.sessionId) {
      const sessionRecord = await prisma.Sessions.findUnique({
        where: {
          sessionId: session.sessionId,
        },
      });

      if (!sessionRecord) {
        return { message: "Session nebyla nalezena" };
      }
    }

    let messageBan = false;
    let ban = false;

    if (session.userId) {
      ban = await checkUserBan(session.userId);

      if (ban.pernament) {
        messageBan = "Váš účet byl trvale zablokován";
      } else {
        messageBan = `Účet byl zabanován do: ${ban.banTill}`;
      }
    }

    if (session.isLoggedIn && !ban) {
      return session;
    } else if (session.isLoggedIn && ban) {
      // Delete all sessions where userId equals session.userId
      await prisma.Sessions.deleteMany({
        where: { userId: session.userId },
      });
      return { message: messageBan };
    } else {
      return { message: "Session nebyla nalezena" };
    }
  } catch (error) {
    console.error("Chyba posílaní session:", error);
    return { message: "Chyba na serveru [GET metoda session]" };
  } finally {
    await prisma.$disconnect(); // Uzavřete připojení po dokončení
  }
};