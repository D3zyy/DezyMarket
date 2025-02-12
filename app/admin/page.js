import React from 'react'
import MenuByRole from './MenuByRole'
import { getSession } from '../authentication/actions'
import { redirect } from 'next/navigation';
import { prisma } from '../database/db';
import { getTypeOfAccountDetails } from '../typeOfAccount/Methods';
import { DateTime } from 'luxon';
import Link from 'next/link';
import { headers } from 'next/headers';
import { checkRateLimit } from '../RateLimiter/rateLimit';
import { getCachedData } from '../getSetCachedData/caching';
const Page = async () => {
const ipToRedis =
headers().get("x-forwarded-for")?.split(",")[0] || 
headers().get("x-real-ip") ||                     
                                                 null;
                                       
                                               const ipCheck = ipToRedis?.startsWith("::ffff:") ? ipToRedis.replace("::ffff:", "") : ipToRedis;
                                           const rateLimitStatus = await checkRateLimit(ipCheck);
                                       
                                           if (!rateLimitStatus.allowed) {
                                            return (
                                              <div className="p-4 text-center">
                                                <h1 className="text-xl font-bold mt-2">
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-red-500 mb-2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
                                      </svg>
                                      
                                                 Příliš mnoho požadavků. Zkuste to zachvíli
                                                  <br />
                                                
                                                </h1>
                                              </div>
                                            )
                                           }
  const now = DateTime.now().setZone('Europe/Prague');
  const today = now.startOf('day');
  const yesterday = today.minus({ days: 1 });
  const startOfThisMonth = now.startOf('month');
  const endOfThisMonth = now.endOf('month');
  const startOfLastMonth = startOfThisMonth.minus({ months: 1 });
  const endOfLastMonth = startOfThisMonth.minus({ milliseconds: 1 });


  let errorsfromServer,countOfAllPosts,activePostsCount,nmbrOfPostsToday,nmbrOfPostsYestrday,nmbrOfPostsThisMonth,nmbrOfPostsLastMonth,session,reports,suppTickets,subscTypes,allTops,countOfAllUSers,registredTodayNumberOfUsr,registredYestrdayNumberOfUsr,registredThisMonthyNumberOfUsr,registredLastMonthyNumberOfUsr,allSubToStats

    session =  await getSession()
    if(!session || session?.role?.privileges <= 1|| !session.isLoggedIn || !session.email ){
      redirect('/');
  }

  try{

   
     [
      errorsfromServer,
      countOfAllPosts,
      activePostsCount,
      nmbrOfPostsToday,
      nmbrOfPostsYestrday,
      nmbrOfPostsThisMonth,
      nmbrOfPostsLastMonth,
      reports,
      suppTickets,
      subscTypes,
      allTops,
      countOfAllUSers,
      registredTodayNumberOfUsr,
      registredYestrdayNumberOfUsr,
      registredThisMonthyNumberOfUsr,
      registredLastMonthyNumberOfUsr,
      allSubToStats
    ] = await Promise.all([
      getCachedData("errorsfromServer", () => prisma.errors.findMany(), 300),
      getCachedData("countOfAllPosts", () => prisma.posts.count(), 300),
      getCachedData("activePostsCount", () => prisma.posts.count({ where: { visible: true } }), 300),
      getCachedData("nmbrOfPostsToday", () => prisma.posts.count({
        where: {
          dateAndTime: {
            gte: today.toISO(),
            lt: today.plus({ days: 1 }).toISO()
          }
        }
      }), 300),
      getCachedData("nmbrOfPostsYestrday", () => prisma.posts.count({
        where: {
          dateAndTime: {
            gte: yesterday.toISO(),
            lt: today.toISO()
          }
        }
      }), 300),
      getCachedData("nmbrOfPostsThisMonth", () => prisma.posts.count({
        where: {
          dateAndTime: {
            gte: startOfThisMonth.toISO(),
            lt: endOfThisMonth.toISO()
          }
        }
      }), 300),
      getCachedData("nmbrOfPostsLastMonth", () => prisma.posts.count({
        where: {
          dateAndTime: {
            gte: startOfLastMonth.toISO(),
            lt: endOfLastMonth.toISO()
          }
        }
      }), 300),
      getCachedData("reports", () => prisma.postReport.findMany({
        where: { active: true },
        include: {
          post: { select: { id: true, name: true } },
          user: {
            select: { id: true, fullName: true, role: { select: { privileges: true } } }
          }
        }
      }), 300),
      getCachedData("suppTickets", () => prisma.supportTickets.findMany({
        where: { active: true },
        include: { ipOfusrOnsup: true }
      }), 300),
      getCachedData("subscTypes", getTypeOfAccountDetails, 300),
      getCachedData("allTops", () => prisma.tops.findMany(), 300),
      getCachedData("countOfAllUsers", () => prisma.users.count(), 300),
      getCachedData("registredTodayNumberOfUsr", () => prisma.users.count({
        where: {
          dateOfRegistration: {
            gte: today.toISO(),
            lt: today.plus({ days: 1 }).toISO()
          }
        }
      }), 300),
      getCachedData("registredYestrdayNumberOfUsr", () => prisma.users.count({
        where: {
          dateOfRegistration: {
            gte: yesterday.toISO(),
            lt: today.toISO()
          }
        }
      }), 300),
      getCachedData("registredThisMonthyNumberOfUsr", () => prisma.users.count({
        where: {
          dateOfRegistration: {
            gte: startOfThisMonth.toISO(),
            lt: endOfThisMonth.toISO()
          }
        }
      }), 300),
      getCachedData("registredLastMonthyNumberOfUsr", () => prisma.users.count({
        where: {
          dateOfRegistration: {
            gte: startOfLastMonth.toISO(),
            lt: endOfLastMonth.toISO()  
          }
        }
      }), 300),
      getCachedData("allSubToStats", () => prisma.accountType.findMany(), 300)
    ]);

    let poststats = {}
    poststats.numberOfAllPosts = countOfAllPosts;
    poststats.numberOfAllActivePosts = activePostsCount;
    poststats.numberOPostsToday = nmbrOfPostsToday
    poststats.numberOPostsYestrday = nmbrOfPostsYestrday
    poststats.numberOPostsThisMonth = nmbrOfPostsThisMonth
    poststats.numberOPostsLastMonth = nmbrOfPostsLastMonth

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
      let numberOfUpgrades = await getCachedData(`numberOfUpgrades_${allSubToStats[j].id}`, () => 
        prisma.accountUpgrades.findMany({
          where: {
            AccountTypeIdAfter: allSubToStats[j].id, // Správný název pole podle modelu
          }
        }), 300);
      
      // Fetch all active users once
      const allUsers = await getCachedData(`allUsers_${allSubToStats[j].id}`, () => 
        prisma.accountTypeUsers.findMany({
          where: {
            accountTypeId: allSubToStats[j].id, // Use id from allSubToStats
          }
        }), 300);
      
      const allUsersCount = await getCachedData(`allUsersCount_${allSubToStats[j].id}`, () => 
        prisma.accountTypeUsers.findMany({
          where: {
            accountTypeId: allSubToStats[j].id, // Use id from allSubToStats
            active: true
          }
        }), 300);
  
     

      // Get the current date and calculate last month and yesterday
      const now = DateTime.now().setZone('Europe/Prague');
      const todayStart = now.startOf('day');
      const yesterdayStart = now.minus({ days: 1 }).startOf('day');
      const currentMonthStart = now.startOf('month');
      const lastMonthStart = now.minus({ months: 1 }).startOf('month');
      const lastMonthEnd = now.minus({ months: 1 }).endOf('month');
      

      const numberOfGifted = allUsers.filter(user => user.gifted && user.active).length;
  
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



  return (
    <div>
      {session.role.privileges > 1 && 
      
       <MenuByRole errorsfromServer={errorsfromServer} poststats={poststats} subscriptionStats={subscriptionStats} topsWithCounts={topCounts} usersStats={usersStats} allTops={allTops} supTick={suppTickets} reports={reports} privileges={session.role.privileges} subscTypes={subscTypes} />
      }
     




    </div>
  )
} catch (error) {
try{

        console.log(error)
      const rawIp =
  headers().get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
  headers().get("x-real-ip") ||                      // Alternativní hlavička                   // Lokální fallback
  null;

// Odstranění případného prefixu ::ffff:
const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;

      const dateAndTime = DateTime.now()
      .setZone('Europe/Prague')
      .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
        await prisma.errors.create({
          data:{
          info: 'Chyba na /admin',
          errorPrinted: error,
          dateAndTime: dateAndTime,
          userId: session?.userId,
          ipAddress:ip,}
        })
      } catch(error){

      }




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