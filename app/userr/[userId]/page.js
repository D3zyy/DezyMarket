
import { prisma } from "@/app/database/db";
import Link from "next/link";
import { getUserAccountTypeOnStripe } from "@/app/typeOfAccount/Methods";
import { getSession } from "@/app/authentication/actions";
import { user } from "@nextui-org/react";
const Page = async ({ params }) => {
  const [session,userAcc, posts, rankingOfUser, bansOfUser] = await Promise.all([
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
    }),
  ]);
   let accType = await getUserAccountTypeOnStripe(userAcc.email);

let emojiForAcc = false
if(accType?.priority > 1){
     emojiForAcc = await prisma.AccountType.findMany({
        where: { name: accType?.name },
        select: { emoji: true }
    });
}



console.log(userAcc)

function formatDateWithDotsWithTime(dateInput) {
  // Zjistíme, zda je vstup instancí Date nebo ISO řetězec
  const dateString = dateInput instanceof Date ? dateInput.toISOString() : dateInput;

  // Rozdělíme ISO string na části (datum a čas)
  const [datePart, timePart] = dateString.split('T');
  const [year, month, day] = datePart.split('-'); // Rozdělíme datum
  return `${day}.${month}.${year} ${timePart.replace('Z', '')}`; // Sestavíme výstup
}
function formatDateWithDotsWithoutTime(dateInput) {
  // Zjistíme, zda je vstup instancí Date nebo ISO řetězec
  const dateString = dateInput instanceof Date ? dateInput.toISOString() : dateInput;

  // Rozdělíme ISO string na datumovou část
  const [datePart] = dateString.split('T');
  const [year, month, day] = datePart.split('-'); // Rozdělíme datum
  return `${day}.${month}.${year}`; // Sestavíme výstup
}

return (
  <>
    <div className="flex justify-center gap-4 p-2 mt-9 md:mt-0">
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
              userAcc.role.privileges === 4
                ? "text-green-500"
                : userAcc.role.privileges === 3
                ? "text-yellow-500"
                :userAcc.role.privileges === 2
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
          <span className="font-semibold">{userAcc.fullName}</span>
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
  <span>{userAcc.fullName} <Link target="_blank" href={`/typeOfAccount`}> <span className="text-sm ml-1" dangerouslySetInnerHTML={{ __html: emojiForAcc && emojiForAcc[0] ? emojiForAcc[0].emoji : '' }} /> </Link></span>
</div>

{(userAcc.id ===  session.userId || session?.role?.privileges > 1) &&
<div className="flex flex-row gap-6 ml-3 mt-2 items-center">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 1 0-2.636 6.364M16.5 12V8.25" />
</svg>
  <span> {userAcc.email}
    
  </span>
</div>
 }
<div className="flex flex-row gap-6 ml-3 mt-2 items-center">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 flex-shrink-0">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
</svg>
  <span>Registrace {formatDateWithDotsWithoutTime(userAcc?.dateOfRegistration)}</span>
</div>
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-14 mt-2">
  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.25V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18V8.25m-18 0V6a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 6v2.25m-18 0h18M5.25 6h.008v.008H5.25V6ZM7.5 6h.008v.008H7.5V6Zm2.25 0h.008v.008H9.75V6Z" />
</svg>

{ (posts.filter(post => post.visible).length > 0) || (posts.length > 0 && session?.role?.privileges > userAcc?.role?.privileges && session?.userId != userAcc?.id ) || session?.role?.privileges === 4 ? (
  posts
    .filter((post) => session?.role?.privileges > userAcc?.role?.privileges && session?.userId != userAcc?.id || post?.visible || session?.role?.privileges === 4) // Admins see all posts, others see only visible ones
    .sort((a, b) => {
      // Nejprve řadíme podle viditelnosti (true první)
      if (a.visible === b.visible) {
        // Pokud jsou viditelnosti stejné, řadíme podle data (nejnovější první)
        return new Date(b.dateAndTime) - new Date(a.dateAndTime);
      }
      // Pokud jsou různé, dáme ty s visible === true na začátek
      return a.visible ? -1 : 1;
    })
    .map((post) => (
      <div key={post.id}>
      <div className="relative mb-4 mt-3 flex flex-col gap-2 max-w-48 break-all border-2 border-gray-700 border-dashed rounded-md p-3">
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
    
        {/* Post name with link */}
        <Link className="underline" target="_blank" href={`/post/${post.id}`}>
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
    </div>
    ))
) : (
  <p className="text-sm mt-2 text-gray-500">
    Tento uživatel nemá žádné příspěvky.
  </p>
)}
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-14 mt-2">
  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
</svg>









        </div>
      </div>
    </div>
  </>
)}


export default Page;