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
     console.log("cookies:",cookies())
      const session = await getIronSession(cookies(),sessionOptions);
      console.log("vevnitr session ziskana:",session)
      if (session && session.sessionId) {
        console.log("vevnitr session máme existuje ")
        console.log("tohle checkuju zda existuje v db:",session.sessionId)
        // Check if the sessionId exists in the database
        const sessionRecord = await prisma.Sessions.findUnique({
          where: {
            sessionId: session.sessionId,
          },
        });
        console.log("vevnitr session máme existuje z db: ",sessionRecord)
        if (!sessionRecord) {
          console.log("vevnitr session  neexistuje  v db")
          // If sessionId is not found in the database, call logOut to clean up
          return {message: "Session nebyla nalezena"}
          // Optionally, you can return an error or handle it as needed
          
        }
        
        // If sessionId exists in the database, return the session
        
       
      }

      console.log("vevnitr session  existuje  v db pokracujeme dal ")
    let messageBan = false
    let ban = false
    let logOut = false

    if(session.userId){
      ban = await checkUserBan(session.userId)

      if (ban.pernament == true) {
      
        messageBan = "Váš účet byl trvale zablokován"
      }  else{
       
       messageBan = `Účet byl zabanován do: ${ban.banTill}`
      }
    }
    
  
    if (session.isLoggedIn && !ban) {
     
      return session
    } else if (session.isLoggedIn && ban) {
        // Delete all sessions where userId equals session.userId
        await prisma.Sessions.deleteMany({
          where: { userId: session.userId },
      });
      
       
      return  {message: messageBan};
    }
    else{
      
      return {message: "Session nebyla nalezena"}
    }
    } catch (error) {
      console.error("Chyba posílaní session:", error);
      return { message: "Chyba na serveru [GET metoda session]" }
    }finally {
      await prisma.$disconnect(); // Uzavřete připojení po dokončení
  }
  };



  export const createSession = async (userToCreate,pass) => {
    console.log("chci vytvorit novou sesion api hit")
    const sessionId = uuidv4(); // Generate a unique session ID
    console.log(userToCreate.roleId)
    try {
      const now = new Date();
      now.setHours(now.getHours() + 2); // Add 2 hours to the current date for validFrom
      const validTill = new Date(now); // Create a copy of the now date
      validTill.setDate(now.getDate() + 2); // Adds 7 days
      let userId = userToCreate.id
      // Create session in the database
      console.log("ukladam tu seassion do db")
      await prisma.Sessions.create({
        data: {
          sessionId,
          userId,
          validFrom: now,
          validTill: validTill,
        },
      });
      let roleName
      let accountTypeName
      console.log("hledam roli uživatele v db pro zakladni")
      if(userToCreate.roleId ){
         roleName = await prisma.Roles.findUnique({
          where: {
            id: userToCreate.roleId ,
          },
        });
      }
      console.log("hledam roli uživatele na stripe ")
       accountTypeName = await getUserAccountTypeOnStripe(userToCreate.email)
       console.log("jmeno uctu pri login:",accountTypeName)
      
      
      // Use iron-session to set the session ID in a cookie
      const session = await getIronSession(await cookies(), sessionOptions);
      console.log("nastaveni:",sessionOptions)
      console.log(" ziskavam session: ",session)
      session.userId = userId;
      session.fullName = userToCreate.fullName
      session.nickname = userToCreate.nickname
      session.email = userToCreate.email
      session.password = pass
      session.role = roleName 
      session.accountType = accountTypeName 
      session.sessionId = sessionId; // Store session ID in session object
      session.isLoggedIn = true;
      console.log("session pred ulozenim ")
     let  resSa =await session.save();
     console.log("odpoved na ulozeni:",resSa)
      console.log("session by mela byt ulozena na klientovi :) ")
  
      return session; // Return the generated session
    } catch (error) {
      console.error("Error creating session:", error);
      throw new Error("Failed to create session"); // Optionally, re-throw with a custom message
    }finally {
      await prisma.$disconnect(); // Uzavřete připojení po dokončení
  }
  };
export const logOut = async (state,formData) => {
    try {

      // Get the current session
      const session = await getIronSession(cookies(),sessionOptions);
      if (session && session.sessionId) {
      
        // Remove the session from the database
        let sessionIdForDb = session.sessionId
        await session.destroy();
        await prisma.Sessions.delete({
          where: {
            sessionId: sessionIdForDb
          },
        });
       
        // Return a success response
        return { success: true, message: "Odhlášení  proběhlo úspěšně", status: 200 };
  
      } else {
        // Return a 401 Unauthorized response if session not found
        return { success: false, message: "Session nebyla nalezena", status: 401 };
      }
  
    } catch (error) {
      console.error("Chyba při odhlašování :", error);
  
      // Return a 500 Internal Server Error response on exception
      return { success: false, message: "Chyba při odhlašování", status: 500 };
    }finally {
      await prisma.$disconnect(); // Uzavřete připojení po dokončení
  }
  };
  
  