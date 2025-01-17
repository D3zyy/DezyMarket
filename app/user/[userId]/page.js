import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
import Link from "next/link";
import { getUserAccountTypeOnStripe } from "@/app/typeOfAccount/Methods";
import { select } from "@nextui-org/react";
const Page = async ({ params }) => {
  const [session, posts, rankingOfUser, bansOfUser] = await Promise.all([
    getSession(),
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
   let accType = await getUserAccountTypeOnStripe(session.email);

let emojiForAcc = false
if(accType?.priority > 1){
     emojiForAcc = await prisma.AccountType.findMany({
        where: { name: accType?.name },
        select: { emoji: true }
    });
}
console.log(emojiForAcc)
  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
  };

  // Formátování data s tečkami
  const formattedDate = new Date(posts[0]?.user?.dateOfRegistration);
  const day = String(formattedDate.getDate()).padStart(2, '0');
  const month = String(formattedDate.getMonth() + 1).padStart(2, '0');
  const year = formattedDate.getFullYear();
  const formattedDateWithDots = `${day}.${month}.${year}`;

  return (
    <div className="flex flex-row items-start justify-center space-x-16 mb-10 mt-5"> {/* Flexbox pro dvě strany */}
      
     
     

      <div className="flex flex-col items-start w-3/3">
        <div className="flex justify-start">

        <div className="flex flex-row gap-4 items-center justify-center border-b-4 border-gray-500 pb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-10 w-10 mt-2">
  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
</svg>


  <p className="text-lg font-semibold">
   Uživatelský účet
  </p>
</div>
        
        </div>

        <div className="flex flex-row gap-4 mt-4 ">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
</svg>

          <p className=" ">{posts[0]?.user?.fullName}</p>

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
        <p>Registrace {formattedDateWithDots}</p>
        </div>
        <div className="flex flex-row gap-4 mt-4 ">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
</svg>

<span dangerouslySetInnerHTML={{ __html: emojiForAcc && emojiForAcc[0] ? emojiForAcc[0].emoji : 'Základní' }} />
        </div>
       
      </div>






      <div className="flex flex-col items-start w-3/3 max-h-96 overflow-auto w-60 min-w-60 scrollbar-hidden " >
        <div className="flex justify-start">
        <div className="flex flex-row gap-4 items-center justify-center border-b-4 border-gray-500 pb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-10 w-10 mt-2 text-gray-500">
  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.25V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18V8.25m-18 0V6a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 6v2.25m-18 0h18M5.25 6h.008v.008H5.25V6ZM7.5 6h.008v.008H7.5V6Zm2.25 0h.008v.008H9.75V6Z" />
</svg>

  <p className="text-lg font-semibold">
    Příspěvky uživatele
  </p>
</div>
        
        </div>
  
        {posts.length > 0 ? (
  posts.map((post) => (
    <div key={post.id}>
        <div className="mb-4 mt-3 flex flex-row gap-2 ">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 flex-shrink-0">
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
</svg>

      <Link className="underline" target="_blank" href={`/post/${post.id}`}>{post.name}</Link>
      </div>
    </div>
  ))
) : (
  <p className="text-sm mt-2 text-gray-500">Tento uživatel nemá žádné příspěvky.</p>
)}
      </div>








      {/* Pravá strana - Sekce pro hodnocení */}
      <div className="flex flex-col items-start w-3/3">
        <div className="flex justify-start">

        <div className="flex flex-row gap-4 items-center justify-center border-b-4 border-yellow-500 pb-4">
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-10 w-10 mt-2 text-yellow-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
  </svg>
  <p className="text-lg font-semibold">
    Hodnocení uživatele
  </p>
</div>
        
        </div>

        {/* Hodnocení uživatele nebo zpráva, pokud žádná nejsou */}
        {rankingOfUser.length > 0 ? (
          rankingOfUser.map((rating) => (
            
            <div key={rating.id} className="flex flex-col justify-start mb-6 mt-4">

<div className="flex flex-row gap-4 mb-2">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
</svg>
<Link target="_blank" className='underline' href={`/user/${rating.fromUser.id}`}>{rating.fromUser.fullName}</Link>
    </div>

               

                  <div className="flex flex-row gap-4 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
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
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
</svg>
              <p>{rating.extraInfo}</p>

</div>
}  
            </div>
          ))
        ) : (
          <p className="text-sm mt-2 text-gray-500">Tento uživatel nemá žádná hodnocení.</p>
        )}
      </div>





    </div>
  );
};

export default Page;