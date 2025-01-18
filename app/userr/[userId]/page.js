
import { prisma } from "@/app/database/db";
import Link from "next/link";
import { getUserAccountTypeOnStripe } from "@/app/typeOfAccount/Methods";
import { getSession } from "@/app/authentication/actions";
const Page = async ({ params }) => {
  const [session,userAcc, posts, rankingOfUser, bansOfUser] = await Promise.all([
    getSession()
    , prisma.users.findUnique({
      where: { id: params?.userId },
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






  return (
    <>
      <div className='flex justify-center gap-4 p-2'>
        <div className="border-2 border-dotted  border-gray-600 min-w-full min-h-[450px]  rounded-md">

        </div>
      </div>
    </>
  )}


export default Page;