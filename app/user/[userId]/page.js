
import { prisma } from "@/app/database/db";
import Link from "next/link";
import { DateTime } from 'luxon'; 
import { getUserAccountTypeOnStripe } from "@/app/typeOfAccount/Methods";
import { getSession } from "@/app/authentication/actions";
import NotFound from "@/app/not-found";
import UpdateBanModal from "../../userr/[userId]/EditBanModal";
import DeleteBanModal from "../../userr/[userId]/DeleteBanModal";
const Page = async ({ params }) => {

  const [session,userAcc, posts, rankingOfUser, bansOfUser] = await Promise.all([
    getSession()
    , prisma.users.findUnique({
      where: { id: params?.userId }, include: {
        role: true,  
      },
    }),
    prisma.posts.findMany({
      where: { userId: params?.userId },
      include: {
        user: true,  // Předpokládám, že vztah mezi userRatings a users je definován jako toUser
      },
    }),
    prisma.userRatings.findMany({
      where: { toUserId: params?.userId },
      include: {
        fromUser: true,  // Předpokládám, že vztah mezi userRatings a users je definován jako toUser
      },
    }),
    prisma.bans.findMany({
      where: { userId: params?.userId },
      include: {
        fromUser: {
          include: {
            role: true, // Fetches the role of the user
          },
        },
      },
    }),
  ]);

  
  const dateAndTime = DateTime.now()
  .setZone('Europe/Prague')
  .toMillis();

  if(!userAcc){
    return <div className="p-4 text-center">
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
  }

   let accType = await getUserAccountTypeOnStripe(userAcc?.email);

let emojiForAcc = false
if(accType?.priority > 1){
     emojiForAcc = await prisma.AccountType.findMany({
        where: { name: accType?.name },
        select: { emoji: true }
    });
}
//console.log('bans:',userAcc?.dateOfRegistration)

function formatDateFromISOString(isoString) {
  const date = new Date(isoString); // převod ISO řetězce na Date objekt
  const day = String(date.getDate()).padStart(2, '0'); // zajišťuje, že den bude dvoumístný
  const month = String(date.getMonth() + 1).padStart(2, '0'); // měsíc je od 0, takže přičítáme 1
  const year = date.getFullYear();

  return `${day}.${month}.${year}`; // formátování na DD.MM.YYYY
}



  const formatDate = (date) => {
    // Pokud je datum typu Date, převedeme ho na řetězec ve formátu ISO
    if (date instanceof Date) {
      date = date.toISOString(); // Převod na ISO řetězec
    }
  
    // Ověříme, že máme platný řetězec
    if (typeof date === 'string' && date.includes('T')) {
      const [datePart, timePart] = date.split('T');
      const [year, month, day] = datePart.split('-');
      const [hours, minutes] = timePart.split(':');
  
      return `${day}.${month}.${year} ${hours}:${minutes}`;
    }
  
    return date; // Pokud to není platné datum, vrátíme původní hodnotu
  };
  return (
    <div  className="flex flex-col  md:flex-row justify-center mx-auto mb-10 mt-14 "> {/* Flexbox pro dvě strany */}
      
     
     

      <div className="flex flex-col  items-center md:items-start justify-center w-3/3 md:mr-24 mb-9 md:mb-0 h-full">
      
        <div className="flex  justify-center ">

        <div className="flex flex-row gap-4 items-center  border-b-4 border-gray-500 pb-4  ">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-10 w-10 mt-2">
  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
</svg>


  <p className="text-lg font-semibold ">
 {session.userId === userAcc?.id ? 'Můj účet   ' : 'Uživatelský účet'}  
  </p>
</div>
        
        </div>

        <div className="flex flex-row gap-4 mt-4 ">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-6 ${
    userAcc.role.privileges === 4
      ? "text-green-500"
      : userAcc.role.privileges === 3
      ? "text-yellow-500"
      :userAcc.role.privileges === 2
      ? "text-red-500"
      : ""
  }`}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
</svg>

          <p className=" ">{userAcc?.fullName}</p>

        </div>
       

        <div className="flex flex-row gap-4 mt-4 ">
        <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 "
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
              />
            </svg>
  
        <p>Registrace {formatDateFromISOString(userAcc?.dateOfRegistration)}</p>
        </div>
        <div className="flex flex-row gap-4 mt-4 ">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
</svg>

<span dangerouslySetInnerHTML={{ __html: emojiForAcc && emojiForAcc[0] ? emojiForAcc[0].emoji : 'Základní' }} />
        </div>
       
      </div>






      <div className="flex  w-3/3     scrollbar-hiddenflex flex-col justify-center items-center md:items-start w-3/3 md:mr-16 mb-9 md:mb-0 h-full  " >
        <div className="flex items-center justify-start">
        <div className="flex flex-row gap-4 items-center justify-center border-b-4 border-gray-500 pb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-10 w-10 mt-2 text-gray-500">
  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.25V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18V8.25m-18 0V6a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 6v2.25m-18 0h18M5.25 6h.008v.008H5.25V6ZM7.5 6h.008v.008H7.5V6Zm2.25 0h.008v.008H9.75V6Z" />
</svg>

  <p className="text-lg font-semibold">
  {session.userId === userAcc?.id ? 'Moje příspěvky   ' : ' Příspěvky uživatele'}  
  </p>
</div>
        
        </div>
  
        {posts.length > 0 ? (
  posts
    .filter((post) => session?.role?.privileges > userAcc?.role?.privileges && session?.userId != userAcc?.id || post?.visible) // Admins see all posts, others see only visible ones
    .map((post) => (
      <div key={post.id}>
        <div className="mb-4 mt-3 flex flex-row gap-2 max-w-48 break-all">
          {/* Default icon */}
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
              d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
            />
          </svg>
          {/* Post name with link */}
          <Link
            className="underline"
            target="_blank"
            href={`/post/${post.id}`}
          >
            {post.name}
          </Link>
          {/* Extra icon for hidden posts (admin only) */}
          {session?.role?.privileges > 1 && !post?.visible && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 shrink-0 text-red-500"
              title="Hidden Post"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
              />
            </svg>
          )}
        </div>
      </div>
    ))
) : (
  <p className="text-sm mt-2 text-gray-500">
    Tento uživatel nemá žádné příspěvky.
  </p>
)}
      </div>








      {/* Pravá strana - Sekce pro hodnocení */}
      <div className="flex  w-3/3   min-w-72 scrollbar-hidden  flex-col justify-center  items-center md:items-start w-3/3 md:mr-16 mb-9 md:mb-0 h-full">
        <div className="flex justify-start">

        <div className="flex flex-row gap-4 items-center justify-center border-b-4 border-yellow-500 pb-4">
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-10 w-10 flex-shrink-0 mt-2 text-yellow-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
  </svg>
  <p className="text-lg font-semibold">
  {session.userId === userAcc?.id ? 'Hodnocení které jsem získal  ' : '  Hodnocení uživatele'} 

  </p>
</div>
        
        </div>

        {/* Hodnocení uživatele nebo zpráva, pokud žádná nejsou */}
        {rankingOfUser.length > 0 ? (
          rankingOfUser.map((rating) => (
            
            <div key={rating.id} className="flex flex-col justify-start mb-6 mt-4">

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
{formatDate(rating.ratedAt)}</p>
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
          ))
        ) : (
          <p className="text-sm mt-2 text-gray-500">Tento uživatel nemá žádná hodnocení.</p>
        )}
      </div>

 
      {(session?.role?.privileges === 4 || session?.role?.privileges > userAcc?.role?.privileges && session?.userId !== params.userId) &&
       
      <div className="flex  w-3/3     scrollbar-hiddenflex flex-col justify-center items-center md:items-start w-3/3 md:mr-16 mb-9 md:mb-0 h-full  " >
        <div className="flex items-center justify-start">
        <div className="flex flex-row gap-4 items-center justify-center border-b-4 border-red-500 pb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-10 w-10 mt-2 text-red-500">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
</svg>

        

  <p className="text-lg font-semibold">
  Bany uživatele
  </p>
</div>
        
        </div>
  
        {bansOfUser.length > 0 ? (
bansOfUser.sort((a, b) => new Date(b.bannedFrom) - new Date(a.bannedFrom))

.map((ban) => (
  
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
      <div className="flex flex-row gap-4">
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
        <div>
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
  
  <span>{formatDate(ban.bannedFrom)}</span>
) : (
  <span>
    {formatDate(ban.bannedFrom)} <br />
    {formatDate(ban.bannedTill)}
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


<div>{ban.pernament ? <> {(session?.role?.privileges > ban?.fromUser?.role?.privileges   || session?.role?.privileges === 4 || session?.userId === ban?.fromUserId)  && <>

<div className="flex flex-row gap-2 mt-2">
<UpdateBanModal banIdd={ban.id} bannedFromm={ban.bannedFrom} bannedToo={ban.bannedTill} reasonn={ban.reason} pernamentt={ban.pernament}/>
<DeleteBanModal banIdd={ban.id} bannedFromm={ban.bannedFrom} bannedToo={ban.bannedTill} reasonn={ban.reason} pernamentt={ban.pernament}/>
</div>
 </>}</> : (DateTime.now().setZone('Europe/Prague').toMillis() >= new Date(ban.bannedTill).getTime() ? "" : <> {(session?.role?.privileges > ban?.fromUser?.role?.privileges   || session?.role?.privileges === 4 || session?.userId === ban?.fromUserId)  && <>

                <div className="flex flex-row gap-2 mt-2">
                <UpdateBanModal banIdd={ban.id} bannedFromm={ban.bannedFrom} bannedToo={ban.bannedTill} reasonn={ban.reason} pernamentt={ban.pernament}/>
                <DeleteBanModal banIdd={ban.id} bannedFromm={ban.bannedFrom} bannedToo={ban.bannedTill} reasonn={ban.reason} pernamentt={ban.pernament}/>
                </div>
                 </>}</>)}</div>


             
 
             
             
  </div>
))
) : (
  <p className="text-sm mt-2 text-gray-500">
    Tento uživatel nemá žádné bany
  </p>
)}
      </div>
 }


    </div>
  );
};

export default Page;