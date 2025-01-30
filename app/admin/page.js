import React from 'react'
import MenuByRole from './MenuByRole'
import { getSession } from '../authentication/actions'
import { redirect } from 'next/navigation';
import { prisma } from '../database/db';
import { getTypeOfAccountDetails } from '../typeOfAccount/Methods';
import { DateTime } from 'luxon';
import Link from 'next/link';
const Page = async () => {

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
  try{
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
    //console.log(allSubToStats)

   

   




    for(let j = 0; j < allSubToStats.length; j++) {
      
      const numberOfUpgrades = await prisma.accountUpgrades.findMany({
        where: {
          AccountTypeIdAfter: allSubToStats[j].id, // Správný název pole podle modelu
          
        }
      });

//console.log("Počet uprgradů:",numberOfUpgrades.length)


      // Fetch all active users once
      const allUsers = await prisma.accountTypeUsers.findMany({
          where: {
              accountTypeId: allSubToStats[j].id, // Use id from allSubToStats
       
          }
      });
      const allUsersCount = await prisma.accountTypeUsers.findMany({
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
  
      const numberOfScheduledToCancel = allUsers.filter(user => user.scheduleToCancel && !user.gifted && user.active).length;
  
      const numberOfEndedLastMonth = allUsers.filter(user => {
          const toDate = DateTime.fromJSDate(user.toDate);
          return !user.gifted && toDate >= lastMonthStart && toDate <= lastMonthEnd;
      }).length;
      const numberOfThisMonthUpgrades = numberOfUpgrades.filter(upgrade => {
        const createdAt = DateTime.fromJSDate(upgrade.dateTime);
        return createdAt >= currentMonthStart;
      }).length;
      
   //   console.log("Počet uprgradů tento měsíc:",numberOfThisMonthUpgrades)

      // Store the results in subscriptionStats
      subscriptionStats[allSubToStats[j].name] = {
        numberOfThisMonthUpgrades: numberOfThisMonthUpgrades,
          numberOfUpgrades: numberOfUpgrades.length,
          emoji: allSubToStats[j].emoji,
          name: allSubToStats[j].name,
          numberOfAllUsers: allUsersCount.length,
          numberOfGifted: numberOfGifted,
          numberOfToday: numberOfToday,
          numberOfYesterday: numberOfYesterday,
          numberOfThisMonth: numberOfThisMonth,
          numberOfLastMonth: numberOfLastMonth,
          numberOfScheduledToCancel: numberOfScheduledToCancel,
          numberOfEndedLastMonth: numberOfEndedLastMonth
      };
  }
  
 // console.log("Statistiky subs:", subscriptionStats);
    

 const allUsersCountt = await prisma.accountTypeUsers.findMany({
  where: {
      active: true
  }
});
console.log("všichni uživatel=:",allUsersCountt)
const sortedTops = [...allTops].sort((a, b) => a.numberOfMonthsToValid - b.numberOfMonthsToValid);

const topCounts = sortedTops.map(top => {
  return {
    ...top,
    userCount: allUsersCountt.filter(user => 
      user.monthIn >= top.numberOfMonthsToValid && 
      (!sortedTops.find(t => t.numberOfMonthsToValid > top.numberOfMonthsToValid && user.monthIn >= t.numberOfMonthsToValid))
    ).length
  };
});


console.log("top count:",topCounts);





  return (
    <div>
      {session.role.privileges > 1 && 
       <MenuByRole subscriptionStats={subscriptionStats} topsWithCounts={topCounts} usersStats={usersStats} allTops={allTops} supTick={suppTickets} reports={reports} privileges={session.role.privileges} subscTypes={subscTypes} />
      }
     




    </div>
  )
} catch (error) {
  return (
    <div className="p-4 text-center">
      <h1 className="text-xl font-bold mt-2">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-red-500 mb-2">
  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
</svg>

     

        Nastala  chyba
        <br />
       <Link  className="btn mt-2" href={"/"}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
<path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
</svg>
</Link>
      </h1>
    </div>
  );
} finally {
  await prisma.$disconnect(); // Uzavřete připojení po dokončení
}
}

export default Page;