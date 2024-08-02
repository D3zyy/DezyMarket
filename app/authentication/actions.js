"use server";
import { sessionOptions, sessionData, defaultSession } from "./lib"
import {  getIronSession } from "iron-session"
import { redirect } from 'next/navigation'
import { cookies } from "next/headers"


export const getSession = async  () => {
    
    const session = await getIronSession(cookies(),sessionOptions)
    
    return session

}

export const createSession = async  (userId) => {

 const session = await getSession()

 session.userId = userId
 session.isBanned = false
 session.isLoggedIn = true
await session.save()
 
return true
}

export const logOut = async  () => {

    const session = await getSession()
    await session.destroy()
}
