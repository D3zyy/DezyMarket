"use server";
import { v4 as uuidv4 } from 'uuid'; 
import { sessionOptions, sessionData, defaultSession } from "./lib"
import {  getIronSession } from "iron-session"
import { cookies } from "next/headers"
import { prisma } from '../database/db';



export const getSession = async () => {
    try {
   
      // Retrieve the session using iron-session
      const session = await getIronSession(cookies(),sessionOptions);

      if (session && session.sessionId) {
        // Check if the sessionId exists in the database
        const sessionRecord = await prisma.Sessions.findUnique({
          where: {
            sessionId: session.sessionId,
          },
        });
  
        if (!sessionRecord) {
            
          // If sessionId is not found in the database, call logOut to clean up
          session.destroy()
          // Optionally, you can return an error or handle it as needed
          
        }
        
        // If sessionId exists in the database, return the session
        
        return session;
      } else {
     
        // Return a 401 Unauthorized response if session not found
        return { success: false, message: "Session nebyla nalezena", status: 401 };
      }
    } catch (error) {
      console.error("Error getting session:", error);
      throw new Error("Error getting session"); // or handle the error as needed
    }
  };



  export const createSession = async (userId) => {
    const sessionId = uuidv4(); // Generate a unique session ID
  
    try {
      const now = new Date();
      now.setHours(now.getHours() + 2); // Add 2 hours to the current date for validFrom
  
      const validTill = new Date(now); // Create a copy of the now date
      validTill.setDate(now.getDate() + 2); // Adds 7 days
      
  
      // Create session in the database
      await prisma.Sessions.create({
        data: {
          sessionId,
          userId,
          validFrom: now,
          validTill: validTill,
        },
      });
  
      // Use iron-session to set the session ID in a cookie
      const session = await getIronSession(cookies(), sessionOptions);
      session.userId = userId;
      session.sessionId = sessionId; // Store session ID in session object
      session.isLoggedIn = true;
      await session.save();
  
      return session; // Return the generated session
    } catch (error) {
      console.error("Error creating session:", error);
      throw new Error("Failed to create session"); // Optionally, re-throw with a custom message
    }
  };
export const logOut = async (req) => {
    try {
      
      // Get the current session
      const session = await getIronSession(cookies(),sessionOptions);
  
      if (session && session.sessionId) {
   
        // Remove the session from the database
        await prisma.Sessions.delete({
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
