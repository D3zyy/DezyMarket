"use server";
import { sessionOptions, sessionData, defaultSession } from "./lib"
import {  getIronSession } from "iron-session"
import { redirect } from 'next/navigation'
import { cookies } from "next/headers"


export const getSession = async  () => {
    
    const session = await getIronSession(cookies(),sessionOptions)
    
    return session

}

export const login = async  (Formemail,Formpassword) => {

 const session = await getSession()


 // zkontrolovat proti databázi...
 


 // nastavíme udaje z db
 session.userId = 1
 session.firstName = "Yo"
 session.lastName = "SecondNameYo"
 session.role = ["Regular"]
 session.email = Formemail
 session.password = Formpassword
 session.isLoggedIn = true
 await session.save()
return true
}

export const logOut = async  () => {

    const session = await getSession()
    await session.destroy()
}
