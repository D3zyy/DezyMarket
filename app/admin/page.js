import React from 'react'
import MenuByRole from './MenuByRole'
import { getSession } from '../authentication/actions'
import { redirect } from 'next/navigation';
import { prisma } from '../database/db';
import { getTypeOfAccountDetails } from '../typeOfAccount/Methods';
import { DateTime } from 'luxon';
const Page = async () => {
  const now = DateTime.now().setZone('Europe/Prague');
  const today = now.startOf('day');
  const yesterday = today.minus({ days: 1 });
  const startOfThisMonth = now.startOf('month');
  const endOfThisMonth = now.endOf('month');
  const startOfLastMonth = startOfThisMonth.minus({ months: 1 });
  const endOfLastMonth = startOfThisMonth.minus({ milliseconds: 1 });


  let session,reports,suppTickets,subscTypes,allTops,countOfAllUSers,registredTodayNumberOfUsr,registredYestrdayNumberOfUsr,registredThisMonthyNumberOfUsr,registredLastMonthyNumberOfUsr

    

    [session,reports,suppTickets,subscTypes,allTops,countOfAllUSers,registredTodayNumberOfUsr,registredYestrdayNumberOfUsr,registredThisMonthyNumberOfUsr,registredLastMonthyNumberOfUsr] = await Promise.all([
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
  })

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



    let subscriptionStats = {}





    console.log("Statistiky:",subscriptionStats);
    //console.log("all tops:",allTops)






  if(!session || session?.role?.privileges <= 1|| !session.isLoggedIn || !session.email ){
      redirect('/');
  }
  return (
    <div>
      {session.role.privileges > 1 && 
       <MenuByRole usersStats={usersStats} allTops={allTops} supTick={suppTickets} reports={reports} privileges={session.role.privileges} subscTypes={subscTypes} />
      }
     




    </div>
  )
}

export default Page