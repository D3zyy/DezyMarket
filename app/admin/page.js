import React from 'react'
import MenuByRole from './MenuByRole'
import { getSession } from '../authentication/actions'
import { redirect } from 'next/navigation';
import { prisma } from '../database/db';
import { getTypeOfAccountDetails } from '../typeOfAccount/Methods';
import { DateTime } from 'luxon';
const Page = async () => {
  try{
  const now = DateTime.now().setZone('Europe/Prague');
  const today = now.startOf('day');
  const yesterday = today.minus({ days: 1 });
  const startOfThisMonth = now.startOf('month');
  const endOfThisMonth = now.endOf('month');
  const startOfLastMonth = startOfThisMonth.minus({ months: 1 });
  const endOfLastMonth = startOfThisMonth.minus({ milliseconds: 1 });


  let session,reports,suppTickets,subscTypes,allTops,countOfAllUSers,registredTodayNumberOfUsr,registredYestrdayNumberOfUsr,registredThisMonthyNumberOfUsr,registredLastMonthyNumberOfUsr,allSubToStats

    session =  await getSession()
    if(!session || session?.role?.privileges <= 1|| !session.isLoggedIn || !session.email ){
      redirect('/');
  }

    [reports,suppTickets,subscTypes,allTops,countOfAllUSers,registredTodayNumberOfUsr,registredYestrdayNumberOfUsr,registredThisMonthyNumberOfUsr,registredLastMonthyNumberOfUsr,allSubToStats] = await Promise.all([

      prisma.postReport.findMany({
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
       prisma.users.count(),

        await prisma.users.count({
        where: {
          dateOfRegistration: {
                gte: today.toISO(), // Od začátku dne
                lt: today.plus({ days: 1 }).toISO() // Do konce dne
            }
        }
    })
,
     await prisma.users.count({
        where: {
            dateOfRegistration: {
                gte: yesterday.toISO(), // Od začátku včerejšího dne
                lt: today.toISO() // Do konce včerejšího dne
            }
        }
    }) , await prisma.users.count({
      where: {
        dateOfRegistration: {
              gte: startOfThisMonth.toISO(),
              lt: endOfThisMonth.toISO()
          }
      }
  }), await prisma.users.count({
      where: {
        dateOfRegistration: {
              gte: startOfLastMonth.toISO(),
              lt: endOfLastMonth.toISO()
          }
      }
  }),   prisma.accountType.findMany(),

    ]);
    function calculatePercentageChange(newValue, oldValue) {
      if (oldValue === 0) return "N/A"; // Nelze dělit nulou
      return ((newValue - oldValue) / oldValue * 100).toFixed(2) + "%";
  }

  const percentChangeTodayVsYesterday = calculatePercentageChange(registredTodayNumberOfUsr, registredYestrdayNumberOfUsr);
  const percentChangeThisMonthVsLastMonth = calculatePercentageChange(registredThisMonthyNumberOfUsr, registredLastMonthyNumberOfUsr);
    let usersStats = {}
    usersStats.numberOfAllUsers = countOfAllUSers;
    usersStats.numberOfRegistredUsrToday = registredTodayNumberOfUsr
    usersStats.numberOfRegistredUsrYestrday = registredYestrdayNumberOfUsr
    usersStats.numberOfRegistredUsrThisMonth = registredThisMonthyNumberOfUsr
    usersStats.numberOfRegistredUsrLastMonth = registredLastMonthyNumberOfUsr
    usersStats.percentChangeTodayVsYesterday = percentChangeTodayVsYesterday
    usersStats.percentChangeThisMonthVsLastMonth = percentChangeThisMonthVsLastMonth


    let subscriptionStats = {};
    console.log(allSubToStats)
    for(let j = 0; j < allSubToStats.length; j++) {
   
      
      // Fetch all active users once
      const allUsers = await prisma.accountTypeUsers.findMany({
          where: {
              accountTypeId: allSubToStats[j].id, // Use id from allSubToStats
              active: true
          }
      });
      
      // Get the current date and calculate last month and yesterday
      const now = DateTime.now().setZone('Europe/Prague');
      const todayStart = now.startOf('day');
      const yesterdayStart = now.minus({ days: 1 }).startOf('day');
      const currentMonthStart = now.startOf('month');
      const lastMonthStart = now.minus({ months: 1 }).startOf('month');
      const lastMonthEnd = now.minus({ months: 1 }).endOf('month');
      
      // Get the count of users for each category
      const numberOfAllUsers = allUsers.length;
  
      const numberOfGifted = allUsers.filter(user => user.gifted).length;
  
      const numberOfToday = allUsers.filter(user => {
          const createdAt = DateTime.fromJSDate(user.fromDate);
         
          return createdAt >= todayStart;
      }).length;
  
      const numberOfYesterday = allUsers.filter(user => {
          const createdAt = DateTime.fromJSDate(user.fromDate);
          return createdAt >= yesterdayStart && createdAt < todayStart;
      }).length;
  
      const numberOfThisMonth = allUsers.filter(user => {
          const createdAt = DateTime.fromJSDate(user.fromDate);
          return createdAt >= currentMonthStart;
      }).length;
  
      const numberOfLastMonth = allUsers.filter(user => {
          const createdAt = DateTime.fromJSDate(user.fromDate);
          return createdAt >= lastMonthStart && createdAt <= lastMonthEnd;
      }).length;
  
      const numberOfScheduledToCancel = allUsers.filter(user => user.scheduleToCancel && !user.gifted).length;
  
      const numberOfEndedLastMonth = allUsers.filter(user => {
          const toDate = DateTime.fromJSDate(user.toDate);
          return !user.gifted && toDate >= lastMonthStart && toDate <= lastMonthEnd;
      }).length;
  
      // Store the results in subscriptionStats
      subscriptionStats[allSubToStats[j].name] = {
          emoji: allSubToStats[j].emoji,
          name: allSubToStats[j].name,
          numberOfAllUsers: numberOfAllUsers,
          numberOfGifted: numberOfGifted,
          numberOfToday: numberOfToday,
          numberOfYesterday: numberOfYesterday,
          numberOfThisMonth: numberOfThisMonth,
          numberOfLastMonth: numberOfLastMonth,
          numberOfScheduledToCancel: numberOfScheduledToCancel,
          numberOfEndedLastMonth: numberOfEndedLastMonth
      };
  }
  
  console.log("Statistiky subs:", subscriptionStats);
    






  return (
    <div>
      {session.role.privileges > 1 && 
       <MenuByRole subscriptionStats={subscriptionStats} usersStats={usersStats} allTops={allTops} supTick={suppTickets} reports={reports} privileges={session.role.privileges} subscTypes={subscTypes} />
      }
     




    </div>
  )
} catch (error) {
  return <> Nastala chyba</>
} finally {
  await prisma.$disconnect(); // Uzavřete připojení po dokončení
}
}

export default Page;