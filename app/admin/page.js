import React from 'react'
import MenuByRole from './MenuByRole'
import { getSession } from '../authentication/actions'
import { redirect } from 'next/navigation';
import { prisma } from '../database/db';
import { getTypeOfAccountDetails } from '../typeOfAccount/Methods';

const Page = async () => {


  let session,reports,suppTickets,subscTypes,allTops
    

    [session,reports,suppTickets,subscTypes,allTops] = await Promise.all([
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
      getTypeOfAccountDetails(),
       prisma.tops.findMany({}),
    ]);

    //console.log("all tops:",allTops)
  if(!session || session?.role?.privileges <= 1|| !session.isLoggedIn || !session.email ){
      redirect('/');
  }
  return (
    <div>
      {session.role.privileges > 1 && 
       <MenuByRole allTops={allTops} supTick={suppTickets} reports={reports} privileges={session.role.privileges} subscTypes={subscTypes} />
      }
     




    </div>
  )
}

export default Page