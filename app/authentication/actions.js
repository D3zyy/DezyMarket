"use server";
import { v4 as uuidv4 } from 'uuid'; 
import { sessionOptions, sessionData, defaultSession } from "./lib"
import {  getIronSession } from "iron-session"
import { redirect } from 'next/navigation'
import { cookies } from "next/headers"
import { prisma } from '../database/db';

export const getSession = async  () => {
    
    const session = await getIronSession(cookies(),sessionOptions)
    
    return session

}



export const createSession = async (userId) => {
  const sessionId = uuidv4(); // Generate a unique session ID

  // Save session ID and userId in your database
  await prisma.Sessions.create({
    data: {
      sessionId,
      userId,
      isLoggedIn: true,
      // Add other session-related data if necessary
    },
  });

  // Use iron-session to set the session ID in a cookie
  const session = await getSession();
  session.userId = userId;
  session.sessionId = sessionId; // Store session ID in session object
  session.isLoggedIn = true;
  await session.save();

  return sessionId; // Return the generated session ID
};

export const logOut = async (req) => {
    try {
      // Get the current session
      const session = await getSession(req);
  
      if (session && session.sessionId) {
        // Remove the session from the database
        await prisma.session.delete({
          where: {
            sessionId: session.sessionId,
          },
        });
  
        // Destroy the session
        await session.destroy();
  
        // Return a success response
        return { success: true, message: "Logged out successfully", status: 200 };
  
      } else {
        // Return a 401 Unauthorized response if session not found
        return { success: false, message: "Session nebyla nalezena", status: 401 };
      }
  
    } catch (error) {
      console.error("Error during logout:", error);
  
      // Return a 500 Internal Server Error response on exception
      return { success: false, message: "Chyba při odhlašování", status: 500 };
    }
  };
