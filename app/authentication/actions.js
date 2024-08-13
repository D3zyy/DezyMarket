"use server";
import { v4 as uuidv4 } from 'uuid'; 
import { sessionOptions, sessionData, defaultSession } from "./lib"
import {  getIronSession } from "iron-session"
import { cookies } from "next/headers"
import { prisma } from '../database/db';
import { checkUserBan } from '../api/session/dbMethodsSession';



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
          return {message: "Session nebyla nalezena"}
          // Optionally, you can return an error or handle it as needed
          
        }
        
        // If sessionId exists in the database, return the session
        
       
      }


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
    }
  };



  export const createSession = async (userToCreate,pass) => {
    const sessionId = uuidv4(); // Generate a unique session ID
  
    try {
      const now = new Date();
      now.setHours(now.getHours() + 2); // Add 2 hours to the current date for validFrom
      
      const validTill = new Date(now); // Create a copy of the now date
      validTill.setDate(now.getDate() + 2); // Adds 7 days
      let userId = userToCreate.id
      
      // Create session in the database
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
      if(userToCreate.roleId ){
         roleName = await prisma.Roles.findUnique({
          where: {
            id: userToCreate.roleId ,
          },
        });
      }
    //correct czech time
    const currentDate = new Date();
    const localISODate = new Date(currentDate.getTime() - (currentDate.getTimezoneOffset() * 60000)).toISOString();
    console.log("cas ted : ",localISODate)
     
         // Fetch the existing UserAccountType record
  const existingAccountType = await prisma.userAccountType.findFirst({
    where: {
      userId: userToCreate.id,
    },
    include: {
      AccountType: true, // Ensure that AccountType details are fetched
    },
  });
  console.log("existuje záznam o typu učtu u tohohle uživatele :",existingAccountType)
  if (existingAccountType) {
    // Check if the existing record's validTill is valid
    const isValid = existingAccountType.validTill > new Date(localISODate);
    console.log("Je aktivní pořád ten typ účtu : ",isValid)
    console.log(existingAccountType.AccountType.name)
    if (!isValid && existingAccountType.AccountType.name !== 'Základní') {
      console.log("tady")
      // If expired and not 'basic', delete the old record
      await prisma.userAccountType.delete({
        where: {
          userId_accountTypeId: {
            userId: userToCreate.id,
            accountTypeId: existingAccountType.accountTypeId,
          },
        },
      });
      const idOfBasicAccType = await prisma.AccountType.findFirst({
        where: {
          name: "Základní"
        }})
      // Insert a new UserAccountType record
      await prisma.userAccountType.create({
        data: {
          userId: userToCreate.id,
          accountTypeId: idOfBasicAccType.id,
          validFrom: localISODate,
        },
      });
      accountTypeName = "Základní"
    } else {
      console.log("tady 1")
      accountTypeName = existingAccountType.AccountType.name;
    }
  } 
  console.log("Jméno učtu které budu vkladat do session :" , accountTypeName)
      
      
      // Use iron-session to set the session ID in a cookie
      const session = await getIronSession(cookies(), sessionOptions);
      session.userId = userId;
      session.email = userToCreate.email
      session.password = pass
      session.role = roleName 
      session.accountType = accountTypeName 
      session.sessionId = sessionId; // Store session ID in session object
      session.isLoggedIn = true;
      await session.save();
  
      return session; // Return the generated session
    } catch (error) {
      console.error("Error creating session:", error);
      throw new Error("Failed to create session"); // Optionally, re-throw with a custom message
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
    }
  };
  
  