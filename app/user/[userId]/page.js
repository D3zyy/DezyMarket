
import { prisma } from "@/app/database/db";
import Link from "next/link";
import { getUserAccountTypeOnStripe } from "@/app/typeOfAccount/Methods";
import { getSession } from "@/app/authentication/actions";
import { user } from "@nextui-org/react";
import DeleteBanModal from "./DeleteBanModal";
import UpdateBanModal from "./EditBanModal";
import { DateTime } from 'luxon'; 
import RemoveBanModal from "./RemoveBanModal";
import CreateBanModal from "./addBanModal";
import { openAddBanModal } from "./addBanModal";
import { ButtOp } from "./butt";
import UpdRoleSelect from "./UpdRoleSelect";
import {GiftSubModal, openGiftSubModal} from "./GiftSubModal";
import CancelSubButton from "./CancelSub";
import ReNewSubButton from "./ReNewSub";
import DeleteSessionBtn from "./BtnDeleteSession";

const Page = async ({ params }) => {
  let emojiForAcc,session,userAcc, posts, rankingOfUser, accType,bansOfUser,isBanned,allRoles,allSub,sessionsOfUser,ipsOfUser,ipsWithOtherUsers,allManagementsActions
  try{
   [session,userAcc, posts, rankingOfUser,bansOfUser] = await Promise.all([
    getSession()
    , prisma.users.findUnique({
      where: { id: params?.userId },
      include: {
        role: true,  
      },
    }),
    prisma.posts.findMany({
      where: { userId: params?.userId },
      include: {
        user: true,  // Předpokládám, že vztah mezi userRatings a users je definován jako toUser
        top: true
      },
    }),
    prisma.userRatings.findMany({
      where: { toUserId: params?.userId },
      include: {
        fromUser: true,  // Předpokládám, že vztah mezi userRatings a users je definován jako toUser
      },
    }),bansOfUser = await prisma.bans.findMany({
      where: { userId: params?.userId },
       include: {
        fromUser: {
          include: {
            role: true, // Fetches the role of the user
          },
        },
      },
    })
  ]);



 if(!userAcc){
  return (
    <div className="p-4 text-center">
      <h1 className="text-xl font-bold mt-2">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"  className="w-12 h-12 mx-auto text-red-500 mb-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM13.5 10.5h-6" />
        </svg>
        Uživatel nenalezen
        <br />
       <Link  className="btn mt-2" href={"/"}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
<path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
</svg>
</Link>
      </h1>
    </div>
  );
}
 
    accType = await getUserAccountTypeOnStripe(userAcc?.email);



    if (session?.role?.privileges > 1) {
      sessionsOfUser = await prisma.sessions.findMany({
        where: { userId: userAcc.id },
      });
    
      ipsOfUser = await prisma.ipAddressesOnUsers.findMany({
        where: { userId: userAcc.id },
        include: {
          ipAddress: true, // Fetches the associated IP address details
        },
      });
       ipsWithOtherUsers = await Promise.all(
        ipsOfUser.map(async (userIp) => {
          const otherUsers = await prisma.ipAddressesOnUsers.findMany({
            where: {
              ipAddressId: userIp.ipAddressId,
              userId: { not: userAcc.id }, // Exclude the current user
            },
            include: {
              user: true, // Include user details for the matching IPs
            },
          });
      
          return {
            ip: userIp.ipAddress.value, // IP address value
            otherUsers: otherUsers.map((entry) => entry.user), // Extract user info
          };
        })
      );
     
}


if(session?.role?.privileges > 3){
  allRoles = await prisma.roles.findMany({});
  
}
//console.log(session)
//console.log(userAcc)
 emojiForAcc = false
if(accType?.priority > 1){
     emojiForAcc = await prisma.AccountType.findMany({
        where: { name: accType?.name },
        select: { emoji: true }
    });
}

  }catch(e){
console.log(e)
  }finally {
          await prisma.$disconnect(); // Uzavřete připojení po dokončení
      }

//console.log(session)
function formatDateWithDotsWithTime(dateInput) {
  // Zjistíme, zda je vstup instancí Date nebo ISO řetězec
  const dateString =
    dateInput instanceof Date
      ? dateInput.toISOString()
      : typeof dateInput === 'string'
      ? dateInput
      : null;

  // Pokud není platný vstup, vrátíme prázdný řetězec nebo chybu
  if (!dateString || !dateString.includes('T')) {
    console.error('Invalid date input:', dateInput);
    return '';
  }

  // Rozdělíme ISO string na části (datum a čas)
  const [datePart, timePart] = dateString.split('T');
  const [year, month, day] = datePart.split('-'); // Rozdělíme datum
  const [hours, minutes] = timePart.split(':'); // Vezmeme pouze hodiny a minuty

  // Sestavíme výstup
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}
function formatDateWithDotsWithoutTime(dateInput) {
  // Zjistíme, zda je vstup instancí Date nebo ISO řetězec
  const dateString = dateInput instanceof Date ? dateInput.toISOString() : dateInput;

  // Rozdělíme ISO string na datumovou část
  const [datePart] = dateString?.split('T');
  const [year, month, day] = datePart?.split('-'); // Rozdělíme datum
  return `${day}.${month}.${year}`; // Sestavíme výstup
}
//console.log(bansOfUser)


function checkBans(bansOfUser) {
  // Aktuální čas v Praze
  const currentTimeInPrague = DateTime.local().setZone("Europe/Prague");

  let isBanned = false;

  // Projdeme všechna data v bansOfUser
  for (const ban of bansOfUser) {
    // Convert bannedFrom and bannedTill to Date objects (they should be in a valid Date format, in UTC)
    const bannedFrom = new Date(ban.bannedFrom);
    const bannedTill = new Date(ban.bannedTill);



    // Check if bannedFrom or bannedTill are invalid Date objects
    if (isNaN(bannedFrom.getTime()) || isNaN(bannedTill.getTime())) {
      console.error("Invalid date format for bannedFrom or bannedTill");
      continue; // Skip invalid dates
    }

    // Convert the banned times from UTC to Prague time for accurate comparison
    const bannedFromInPrague = DateTime.fromJSDate(bannedFrom).setZone("Europe/Prague").toJSDate();
    const bannedTillInPrague = DateTime.fromJSDate(bannedTill).setZone("Europe/Prague").toJSDate();


    // Pokud je ban permanentní
    if (ban.pernament) {
      isBanned = true;
      break; // Pokud je permanentní ban, není třeba pokračovat
    }

    // Compare the current time in Prague with the banned time range
    const currentTime = currentTimeInPrague.toJSDate();

    // Pokud je aktuální čas mezi bannedFrom a bannedTill
    if (currentTime >= bannedFromInPrague && currentTime <= bannedTillInPrague) {
      isBanned = true;
      break; // Uživatel je zabanovaný
    }
  }

  return isBanned;
}


if(session?.role?.privileges > 2   ){
  // fetch all types
   allSub = await prisma.accountType.findMany({
    where: {
      priority: {
        gt: 1, // gt znamená "greater than" (větší než)
      },
    },
  });

}

isBanned = checkBans(bansOfUser)
console.log('Is user banned:', isBanned);
if(session?.role?.privileges > 3 && userAcc?.role?.privileges > 1   ){
  allManagementsActions = await prisma.managementActions.findMany({
    where: {
      fromUserId: userAcc?.id,
    
    }, include: {
      fromUser: true,
      toUser: true,
      post: true

    },
  });
console.log("Mana act:",allManagementsActions)
}



return (
  <>
    <div className="flex justify-center gap-4 p-2 mt-9 ">
      <div className="relative border-2 border-dotted border-gray-900 w-[700px] min-h-[450px] rounded-md">
        {/* Text a SVG zarovnané nad rámeček bez přerušení borderu */}
        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2  bg-base-100 px-4 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`w-8 h-8 ${
              userAcc?.role?.privileges === 4
                ? "text-green-500"
                : userAcc?.role?.privileges === 3
                ? "text-yellow-500"
                :userAcc?.role?.privileges === 2
                ? "text-red-500"
                : ""
            }`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
          <span className="font-semibold whitespace-nowrap">{userAcc?.fullName}  {isBanned &&  <span className="ml-2 text-red-500 text-sm badge border-red-500 ">Banned</span>}    </span>
  
        </div>
        
<div className="p-10 mt-2">


        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-14"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z"
          />
        </svg>
        <div className="flex flex-row gap-6 ml-2 mt-2 items-center">
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 flex-shrink-0">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
  <span className=" whitespace-nowrap" >{userAcc.fullName} <Link target="_blank" href={`/typeOfAccount`}> <span className="text-sm ml-1" dangerouslySetInnerHTML={{ __html: emojiForAcc && emojiForAcc[0] ? emojiForAcc[0].emoji : '' }} /> </Link></span>
</div>

{(userAcc.id ===  session.userId || session?.role?.privileges > userAcc.role.privileges ||session?.role?.privileges >3 ) &&
<div className="flex flex-row gap-6 ml-3 mt-2 items-center">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 1 0-2.636 6.364M16.5 12V8.25" />
</svg>
  <span> {userAcc.email}
    
  </span>
</div>
 }
<div className="flex flex-row gap-6 ml-3 mt-2 items-center ">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 flex-shrink-0">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
</svg>
  <span>Registrace {formatDateWithDotsWithoutTime(userAcc?.dateOfRegistration)}</span>
</div>




























{session?.role?.privileges > 3 &&
<div className="flex flex-row gap-6 ml-3 mt-2 items-center ">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 flex-shrink-0">
  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
</svg>
<UpdRoleSelect idOfUser={userAcc.id} allroles={allRoles} sessionroleid={userAcc?.role?.id}/>

</div>
}
{ (session?.role?.privileges > 2&& userAcc?.id != session.userId&& session?.role?.privileges > userAcc?.role?.privileges || session?.role?.privileges > 3)&&
<div className="flex flex-row gap-6 ml-3 mt-3 items-center ">

<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 flex-shrink-0">
  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
</svg>
 

{(session?.role?.privileges > 2 &&  userAcc?.id != session.userId && accType?.priority <= 1 || session?.role?.privileges > 2 &&accType?.priority <= 1||  session?.role?.privileges > 2 &&accType?.priority == null )&&
<> <button disabled={accType?.priority > 1} onClick={openGiftSubModal} className="btn btn-sm"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 text-green-500">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
</svg>
 Darovat předplatné</button>  < GiftSubModal idOfUser={userAcc.id} allSub={allSub}/> </>

}
{(session.role.privileges > 2 && accType?.priority > 1 ) && 
<>
{   accType?.scheduleToCancel && !accType.gifted ? <ReNewSubButton  name={accType?.name} useToId={userAcc?.id}/> : <CancelSubButton pri={ accType?.priority} gifted={accType?.gifted} name={accType?.name} useToId={userAcc?.id}/>}
<br />


</>
}


</div>
}
{(session?.role?.privileges > 2&& userAcc?.id != session.userId&& session?.role?.privileges > userAcc?.role?.privileges && accType?.priority > 1|| session?.role?.privileges > 3 && accType?.priority > 1)&&  
  <>
  <div className="ml-9 p-4 flex flex-col">
  <div className="flex flex-row gap-4 mb-2">
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 flex-shrink-0">
  <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
</svg>

Aktivní od {accType?.fromDate && (
  <span>{formatDateWithDotsWithoutTime(accType?.fromDate)}</span>
)}
  </div>
  <div className="flex flex-row gap-4 mb-2">
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
</svg>
Aktivní do  {accType?.toDate && (
  <span>{formatDateWithDotsWithoutTime(accType?.toDate)}</span>
)}
</div>
<div className="flex flex-row gap-4 mb-2">
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
</svg>
Měsíc:  {accType?.monthIn}.
</div>
<div className="flex flex-row gap-4 mb-2">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
</svg>
Giftnutý: {accType?.gifted ? 'Ano' : 'Ne'}
</div>
{!accType?.gifted &&
<div className="flex flex-row gap-4">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
</svg>
Bude ukončen: {accType?.scheduleToCancel ? 'Ano' : 'Ne'}
</div>
 }
</div>

</>
}

{(session?.role?.privileges > 1 &&  session?.role?.privileges > userAcc.role.privileges   ||session?.role?.privileges > 3) &&  <>
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-14 mt-4">
  <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" />
</svg>



      {/* Pravá strana - Sekce pro hodnocení */}
      <div
     
  className={`flex scrollbar-hidden flex-col ${ sessionsOfUser.length > 0&&"items-center"} ${
    sessionsOfUser.length > 0 && sessionsOfUser.length !=1    ? "items-center" : ""

  }`}
>

      

        
        {/* Hodnocení uživatele nebo zpráva, pokud žádná nejsou */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-4`}>
        {sessionsOfUser.length > 0 ? ( 
      
      sessionsOfUser.map((session) => (
        <div key={session.id} className="relative mt-3 flex flex-col gap-2 max-w-96 max-h-[350px] break-all border-2 dark:border-gray-700 border-gray-300 border-dashed rounded-md p-3" >
       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-base-100 p-1 rounded-full size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" />
</svg>

          <>
          <div className="flex flex-col gap-4">

          
               <span className="flex flex-row gap-4">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>

{formatDateWithDotsWithTime(session.validFrom)}
</span>
<span className="flex flex-row gap-4">

<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>

{formatDateWithDotsWithTime(session.validTill)}
</span>  
<DeleteSessionBtn sessionId={session.id}/>
</div>       
</>

       </div>
          ) ) 
        ) : (
          <p className="text-sm mt-2 text-gray-500  whitespace-nowrap ">Tento uživatel nemá žádnou aktivní session.</p>
        )}
        </div>
      </div>







      </>
}














   



{(session?.role?.privileges > 3  && userAcc?.role?.privileges > 1) &&  <>
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-14 mt-4">
  <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 1 0-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 0 1 3.15 0v1.5m-3.15 0 .075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 0 1 3.15 0V15M6.9 7.575a1.575 1.575 0 1 0-3.15 0v8.175a6.75 6.75 0 0 0 6.75 6.75h2.018a5.25 5.25 0 0 0 3.712-1.538l1.732-1.732a5.25 5.25 0 0 0 1.538-3.712l.003-2.024a.668.668 0 0 1 .198-.471 1.575 1.575 0 1 0-2.228-2.228 3.818 3.818 0 0 0-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0 1 16.35 15m.002 0h-.002" />
</svg>




      {/* Pravá strana - Sekce pro hodnocení */}
      <div
     
  className={`flex scrollbar-hidden flex-col ${ sessionsOfUser.length > 0&&"items-center"} ${
    sessionsOfUser.length > 0 && sessionsOfUser.length !=1    ? "items-center" : ""

  }`}
>

      

        
        {/* Hodnocení uživatele nebo zpráva, pokud žádná nejsou */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-4`}>
        {allManagementsActions.length > 0 ? ( 
      
      allManagementsActions .sort((a, b) => new Date(b.doneAt) - new Date(a.doneAt)) .map((action) => (
        <div key={action.id} className="relative mt-3 flex flex-col gap-2 max-w-96  break-all border-2 dark:border-gray-700 border-gray-300 border-dashed rounded-md p-3" >
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-base-100 p-1 rounded-full size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 1 0-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 0 1 3.15 0v1.5m-3.15 0 .075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 0 1 3.15 0V15M6.9 7.575a1.575 1.575 0 1 0-3.15 0v8.175a6.75 6.75 0 0 0 6.75 6.75h2.018a5.25 5.25 0 0 0 3.712-1.538l1.732-1.732a5.25 5.25 0 0 0 1.538-3.712l.003-2.024a.668.668 0 0 1 .198-.471 1.575 1.575 0 1 0-2.228-2.228 3.818 3.818 0 0 0-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0 1 16.35 15m.002 0h-.002" />
</svg>

          <>
          <div className="flex flex-col gap-4">

          
               <span className="flex flex-row gap-4">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 flex-shrink-0">
  <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
</svg>


{action.info}
</span>
<span className="flex flex-row gap-4">

<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>

{formatDateWithDotsWithTime(action.doneAt)}
</span>  



{action?.toUser && !action?.post &&
<span className="flex flex-row gap-4"> 
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 flex-shrink-0">
  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
</svg>

<Link className="underline" target="_blank" href={`/user/${action?.toUser?.id}`}>
  {action?.toUser?.fullName}
</Link>

</span>

}

{action?.post?.name && <>

<span className="flex flex-row gap-4"> 
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 flex-shrink-0">
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
</svg>
<Link className="underline" target="_blank" href={`/post/${action?.post?.id}`}>
  {action?.post?.name}
</Link>

</span>
{action?.valueBefore &&<> 
<span className="flex flex-row gap-4"> 
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 flex-shrink-0">
  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
</svg>

Před: {action?.valueBefore}
  </span>

  <span className="flex flex-row gap-4"> 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 flex-shrink-0">
  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
</svg>
 Po: {action?.valueAfter}
  </span>
  </>
 }
</>
} 


</div>       
</>

       </div>
          ) ) 
        ) : (
          <p className="text-sm mt-2 text-gray-500  whitespace-nowrap ">Tento uživatel nevykonal žádný admin úkon.</p>
        )}
        </div>
      </div>







      </>
}






































{(session?.role?.privileges > 1 &&  session?.role?.privileges > userAcc.role.privileges   ||session?.role?.privileges > 3) &&  <>
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-14 mt-4">
  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
</svg>



      {/* Pravá strana - Sekce pro hodnocení */}
      <div
     
  className={`flex scrollbar-hidden flex-col ${ sessionsOfUser.length > 0&&"items-center"} ${
    sessionsOfUser.length > 0 && sessionsOfUser.length !=1    ? "items-center" : ""

  }`}
>

      

        
        {/* Hodnocení uživatele nebo zpráva, pokud žádná nejsou */}
     
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {ipsOfUser.length > 0 ? (
    ipsWithOtherUsers.map((ipWithUsers) => {
      // Najdeme odpovídající záznam v ipsOfUser
      const matchingIp = ipsOfUser.find(
        (ipOfUser) => ipOfUser.ipAddress.value === ipWithUsers.ip
      );

      return (
        <div
          key={ipWithUsers.ip}
          className="relative mt-3 flex flex-col gap-2 max-w-96 max-h-[350px] break-all border-2 dark:border-gray-700 border-gray-300 border-dashed rounded-md p-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-base-100 p-1 rounded-full size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
            />
          </svg>

          <div className="flex flex-col gap-4">
            <span className="flex flex-row gap-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
                />
              </svg>
              Přihlášeno {matchingIp?.usedForLogin || 0}x
            </span>

            <span className="flex flex-row gap-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              IP: {ipWithUsers.ip}
            </span>
          </div>

          {ipWithUsers.otherUsers.length > 0 && (
            <div className="mt-2">
              <h4 className="font-bold mb-2">Stejná ip</h4>
              <ul>
                {ipWithUsers.otherUsers.map((user) => (
                  <li  className="mb-2" key={user.id}>
                    
                    <Link
                      href={`/user/${user.id}`}
                      target="_blank"
                      className="underline  "
                    >
                      <div className="flex flex-row gap-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
</svg>
   {user.fullName}
                      </div>
                   
                   </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    })
  ) : (
    <p className="text-sm mt-2 text-gray-500 whitespace-nowrap">
      Tento uživatel nemá žádnou zaznamenanou IP adresu.
    </p>
  )}
</div>






      </div>







      </>
}

















{(session?.role?.privileges > 1 && session?.role?.privileges > userAcc?.role?.privileges && session?.userId !== params.userId) && (
  <>
    <div className="flex flex-row gap-4 mt-6 text-center items-center mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-14  ">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
     <ButtOp />
      <CreateBanModal userIdd={userAcc?.id} />
    </div>
  </>
)}
{(session?.role?.privileges > 1 && session?.role?.privileges > userAcc?.role?.privileges && session?.userId !== params.userId) &&
       
<div
  className={`flex flex-col  w-full md:mr-16 mb-9 md:mb-0  ${
    bansOfUser.length > 0 ? "justify-center items-center" : ""
  } scrollbar-hidden`}
>
         <div  className={`"flex  scrollbar-hidden  ${bansOfUser.length > 0 > 0&&"items-center justify-center"} `}>

         
         </div>
         <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2  gap-4`}> 
         {bansOfUser.length > 0 ? (
 bansOfUser.sort((a, b) => new Date(b.bannedFrom) - new Date(a.bannedFrom))
 
 .map((ban) => ( <div key={ban.id} className="relative mt-3 flex flex-col gap-2 max-w-96 max-h-[350px] break-all border-2 dark:border-gray-700 border-gray-300 border-dashed rounded-md p-3" >
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-base-100 p-1 rounded-full size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
</svg>

   <div className="mb-10 mt-5" key={ban.id}>
         <div className="flex flex-row gap-2 mb-2">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"   className={`size-6 ${
     ban?.fromUser?.role?.privileges === 4
       ? "text-green-500"
       : ban?.fromUser?.role?.privileges === 3
       ? "text-yellow-500"
       : ban?.fromUser?.role?.privileges === 2
       ? "text-red-500"
       : "text-red-500"
   }`}>
   <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
 </svg>

 {ban?.fromUser?.fullName ? (
   <Link target="_blank" className='underline ml-2' href={`/user/${ban?.fromUser?.id}`}>
     {ban?.fromUser?.fullName}
   </Link>
 ) : (
   <span className="ml-2">{'Systém'}</span>
 )}
 
 
       </div>
     <div className=" flex flex-row gap-2 max-w-48 break-all">
   
     {ban.reason &&
       <div className="flex flex-row gap-4  ">
         <svg
           xmlns="http://www.w3.org/2000/svg"
           fill="none"
           viewBox="0 0 24 24"
           strokeWidth={1.5}
           stroke="currentColor"
           className="size-6 flex-shrink-0"
         >
           <path
             strokeLinecap="round"
             strokeLinejoin="round"
             d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
           />
         </svg>
         <div className="max-h-32 overflow-scroll">
          {ban.reason}
         </div>
         
         
       </div>
        }
     </div>
     <div className="flex flex-row gap-4 mt-2">
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
   <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z" />
 </svg>
 {ban.pernament ? (
   
   <span>{formatDateWithDotsWithTime(ban.bannedFrom)}</span>
 ) : (
   <span>
     {formatDateWithDotsWithTime(ban.bannedFrom)} <br />
     {formatDateWithDotsWithTime(ban.bannedTill)}
   </span>
 )}
 
     </div>
     <div className="mt-2 flex flex-row gap-2">
               Permanentní: {ban.pernament? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
   <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
 </svg>
  : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
   <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
 </svg>
 }
 
               </div>
 
 
 <div>{ban.pernament  || (session?.role?.privileges >3) ? <> {(session?.role?.privileges > ban?.fromUser?.role?.privileges   || session?.role?.privileges > 3 || session?.userId === ban?.fromUserId)  && <>

 <div className="flex flex-row gap-2 mt-2">
 <UpdateBanModal banIdd={ban.id} bannedFromm={ban.bannedFrom} bannedToo={ban.bannedTill} reasonn={ban.reason} pernamentt={ban.pernament}/>
 <DeleteBanModal banIdd={ban.id} bannedFromm={ban.bannedFrom} bannedToo={ban.bannedTill} reasonn={ban.reason} pernamentt={ban.pernament}/>
 </div>
  </>}</> : (DateTime.now().setZone('Europe/Prague').toMillis() >= new Date(ban.bannedTill).getTime() ? "" : <> {(session?.role?.privileges > ban?.fromUser?.role?.privileges   || session?.role?.privileges > 3 || session?.userId === ban?.fromUserId)  && <>

                 <div className="flex flex-row gap-2 mt-2">
                 <UpdateBanModal banIdd={ban.id} bannedFromm={ban.bannedFrom} bannedToo={ban.bannedTill} reasonn={ban.reason} pernamentt={ban.pernament}/>
                 <DeleteBanModal banIdd={ban.id} bannedFromm={ban.bannedFrom} bannedToo={ban.bannedTill} reasonn={ban.reason} pernamentt={ban.pernament}/>
                 
               
                 </div>

               


                 </>}</>)}   {session?.role?.privileges > 3 && <>
                 <div className="flex flex-row gap-2 mt-2">
                 <RemoveBanModal  banIdd={ban.id} bannedFromm={ban.bannedFrom} bannedToo={ban.bannedTill} reasonn={ban.reason} pernamentt={ban.pernament}/>
                </div></>} </div>
 
 
              
  
              
              
   </div>
  </div> ))
 ) : (
   <p className="text-sm mt-2 text-gray-500  whitespace-nowrap">
     Tento uživatel nemá žádné bany
   </p>
 )}</div>
       </div>
  }





<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-14 mt-4">
  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
</svg>
      {/* Pravá strana - Sekce pro hodnocení */}
      <div
     
  className={`flex scrollbar-hidden flex-col ${ rankingOfUser.length > 0&&"items-center"} ${
    rankingOfUser.length > 0 && rankingOfUser.length !=1    ? "items-center" : ""

  }`}
>

        <div className="flex justify-start">

        
        
        </div>

        
        {/* Hodnocení uživatele nebo zpráva, pokud žádná nejsou */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-4`}>
        {rankingOfUser.length > 0 ? ( 
      
          rankingOfUser.map((rating) => (
            
            <div key={rating.id} className="relative mt-3 flex flex-col gap-2 max-w-48 break-all border-2 dark:border-gray-700 border-gray-300 border-dashed rounded-md p-3">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-base-100 p-1 rounded-full size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
</svg>

<div className="flex flex-row gap-4 mb-2">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 flex-shrink-0">
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
</svg>
<Link target="_blank" className='underline' href={`/user/${rating.fromUser?.id}`}>{rating?.fromUser?.fullName}</Link>
    </div>

               

                  <div className="flex flex-row gap-4 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 flex-shrink-0">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z" />
</svg>   <p>
{formatDateWithDotsWithoutTime(rating.ratedAt)}</p>
                    </div>
           
              <div className="rating">
                {[...Array(5)].map((_, index) => (
                  <input
                  disabled={true}
                    key={index}
                    type="radio"
                    name={`rating-${rating.id}`}
                    className="mask mask-star-2 bg-orange-400"
                    defaultChecked={index < rating.numberOfStars}
                  />
                ))}
              </div>
        {rating.extraInfo &&    <div className="flex flex-row gap-4 mb-2 mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 flex-shrink-0">
  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
</svg>
              <p className=" max-w-48   overflow-scroll max-h-32 break-all">{rating.extraInfo}</p>

</div>
}  

            </div>
          ) ) 
        ) : (
          <p className="text-sm mt-2 text-gray-500  whitespace-nowrap ">Tento uživatel nemá žádná hodnocení.</p>
        )}
        </div>
      </div>










      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-14 mt-4">
  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.25V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18V8.25m-18 0V6a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 6v2.25m-18 0h18M5.25 6h.008v.008H5.25V6ZM7.5 6h.008v.008H7.5V6Zm2.25 0h.008v.008H9.75V6Z" />
</svg>

{(posts.filter(post => post.visible).length > 0) || (posts.length > 0 && session?.role?.privileges > userAcc?.role?.privileges && session?.userId != userAcc?.id ) || session?.role?.privileges === 4 ? (
  <div
  className={`flex scrollbar-hidden 
    justify-center 
    ${session?.role?.privileges > 1 && posts.length > 1 ? "lg:justify-center" : "lg:justify-start"}
    ${session?.role?.privileges <= 1 && posts.filter(post => post.visible).length > 1 ? "lg:justify-center" : "lg:justify-start"}


  `}
>
 

  <div id="PostsOfUser" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4  "> {/* Tento div bude grid kontejner */}
    {posts
      .filter((post) => session?.role?.privileges > userAcc?.role?.privileges && session?.userId != userAcc?.id || post?.visible || session?.role?.privileges === 4) 
      .sort((a, b) => {
        if (a.visible === b.visible) {
          return new Date(b.dateAndTime) - new Date(a.dateAndTime);
        }
        return a.visible ? -1 : 1;
      })
      .map((post) => (
        <div key={post.id} className="relative mt-3 flex flex-col gap-2 max-w-48 break-all border-2 dark:border-gray-700 border-gray-300 border-dashed rounded-md p-3  ">
          {/* Default icon */}
         
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-base-100 p-1 rounded-full size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
            />
          </svg>
{/* Extra icon for hidden posts (admin only) */}
{session?.role?.privileges > 1 && !post?.visible && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 shrink-0 text-red-500 "
              title="Hidden Post"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
              />
            </svg>
          )}
{post?.topId !== null && <div
  className="  badge badgem-sm badge-outline "
  style={{
    fontSize: '0.875rem',
    padding: '10px',
   
    borderColor: post?.top?.color
  }}
>
<Link
      href={session?.isLoggedIn ? `/typeOfAccount` : ``}
      style={{ color: post?.top?.color }}
    >
 { post?.top?.emoji ? <span className="mr-1" dangerouslySetInnerHTML={{ __html: post?.top?.emoji }}></span> : ""}
     
      {post?.top?.name}

    </Link>
  </div>}
          {/* Post name with link */}
          <Link className="underline " target="_blank" href={`/post/${post.id}`}>
            {post.name}
          </Link>

          
          {/* Second line with date and icon */}
          <div className="flex flex-row gap-4 mt-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 flex-shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z"
              />
            </svg>
            {formatDateWithDotsWithoutTime(post.dateAndTime)}
          </div>
        </div>
      ))}
  </div>
  </div>
) : (
  <p className="text-sm mt-2 text-gray-500 whitespace-nowrap  ">
    Tento uživatel nemá žádné příspěvky.
  </p>
)}












        </div>
      </div>
    </div>
  </>
)}


export default Page;