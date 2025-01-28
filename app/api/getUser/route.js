import {  NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";

    export async function POST(req) {
      try {
        let data;
        try {
          data = await req.json();
          if(!data){
            return new Response(
                JSON.stringify({ message: "Chybně formátovaný požadavek." }),
                {
                  status: 400,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
          }
          console.log("Data který sem dostal na gift subuuuu :", data);
        } catch (error) {
          return new Response(
            JSON.stringify({ message: "Chybně formátovaný požadavek." }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
        
        const session = await getSession();
        if (!session || !session.isLoggedIn || !session.email) {
          return new Response(
            JSON.stringify({
              message: "Chyba na serveru [POST] požadavek na získání uživatelů příspěvku . Session nebyla nalezena "
            }),
            {
              status: 403,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
        if(session.role.privileges <= 1){
            return new Response(
                JSON.stringify({
                  message: "Nemáte pravomoce na tento příkaz "
                }),
                {
                  status: 403,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
        }
//, mode: 'insensitive' only on postgres
const usersAll = await prisma.users.findMany({
    where: {
      OR: [
        { id: { contains: data.info } },
        { email: { contains: data.info } },
        { fullName: { contains: data.info } },
      ]
    },
    include: {
      role: {
        select: {
          privileges: true
        }
      }
    }
  });
  
  // Transform the result to only include the desired fields
  const users = usersAll.map(user => ({
    id: user.id,
    fullName: user.fullName,
    privileges: user.role?.privileges || null // Handle cases where role might be null
  }));
  

          console.log("tyhle uživagtele jsem našel:",users)

        return new Response(JSON.stringify({ users: users }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
    


      } catch (error) {
        console.error('Chyba na serveru [POST] požadavek informace o předplatném:  ', error);
        return new NextResponse(
          JSON.stringify({
            message: 'Chyba na serveru [POST] požadavek informace o předplatném'
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      } finally {
        await prisma.$disconnect(); // Uzavřete připojení po dokončení
      }
    }

