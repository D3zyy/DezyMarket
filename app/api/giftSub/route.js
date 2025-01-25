import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";

export async function POST(req) {
    try {
        let data 
        try {

             data = await req.json();
            console.log("Data který sem dostal na gift subuuuu :",data)
          } catch (error) {
            return new Response(JSON.stringify({ message: "Chybně formátovaný požadavek." }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        // Ensure the session is retrieved correctly
        const session = await getSession();
        if (!session || !session.isLoggedIn || !session.email) {
            return new Response(JSON.stringify({
                message: "Chyba na serveru [POST] požadavek na získání nahlašení příspěvku . Session nebyla nalezena "
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
       
       
       
   

       

 
       
          
        return new Response(JSON.stringify({
             }), {
           
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Chyba na serveru [POST] požadavek informace o předplatném:  ', error);
        return new NextResponse(JSON.stringify({
            message: 'Chyba na serveru [POST] požadavek informace o předplatném'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }finally {
      await prisma.$disconnect(); // Uzavřete připojení po dokončení
  }
}
