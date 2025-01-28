import React from 'react'
import MenuByRole from './MenuByRole'
import { getSession } from '../authentication/actions'
import { redirect } from 'next/navigation';
import { prisma } from '../database/db';


const Page = async () => {


  let session,reports,suppTickets
    

    [session,reports,suppTickets] = await Promise.all([
      getSession()
      , prisma.postReport.findMany({
        where: {
          active: true,
        },
        include: {
          post: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              fullName: true,
              role: {
                select: {
                  privileges: true,
                },
              },
            },
          },
        },
      }),
      prisma.supportTickets.findMany({where: { active: true }, include : {ipOfusrOnsup : true} }),
     
    ]);

  
  if(!session || session?.role?.privileges <= 1|| !session.isLoggedIn || !session.email ){
      redirect('/');
  }
  return (
    <div>
      {session.role.privileges > 1 && 
       <MenuByRole supTick={suppTickets} reports={reports} privileges={session.role.privileges} />
      }
     




    </div>
  )
}

export default Page