import { redirect } from 'next/navigation';
import React from 'react';
import { getSession } from '../authentication/actions';
import NotLoggedIn from '../components/NotLoggedIn';
import { getUserAccountTypeOnStripe } from '../typeOfAccount/Methods';
import Account from '../typeOfAccount/Account';
import Post from './Post';
import AddUI from './AddUI';
import { prisma } from '../database/db';
import Link from 'next/link';
import { DateTime } from 'luxon';
import { headers } from "next/headers";
import { openLoginModal } from '../components/modals/LoginModal';
import { checkRateLimit } from '../RateLimiter/rateLimit';
import { getCachedData } from '../getSetCachedData/caching';
const Page = async () => {
    let session
    let accType
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
    
            session = await getSession();
           
    
             accType = await getUserAccountTypeOnStripe(session.email);
            let accPriority = accType?.priority
          let   accMonthIn= accType?.monthIn
             accType = accType?.name

              // Perform redirect if no account type is found and the user is logged in
        if (!accType && session.isLoggedIn) {
          redirect('/typeOfAccount'); // Call redirect without await
      }
             try {
       

       

              const dateAndTime = DateTime.now()
                      .setZone('Europe/Prague')
                      .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
        // Fetching Categories and Sections with error handling
        let CategoriesFromDb, SectionsFromDb,typeofPosts,typeTops,accEmojis,allowedNumberOfImg;
        try {

          [CategoriesFromDb, SectionsFromDb, typeofPosts, typeTops, accEmojis, allowedNumberOfImg] = await Promise.all([
            getCachedData(`categoriesFromDb`, () => prisma.categories.findMany({}), 31556952),
            getCachedData(`sectionsFromDb`, () => prisma.sections.findMany({}), 31556952),
            getCachedData(`typeofPosts_${dateAndTime}`, () => prisma.postType.findMany({
                where: {
                    OR: [
                        { validFrom: { lte: dateAndTime }, validTo: { gte: dateAndTime } },
                        { validFrom: null, validTo: null }
                    ]
                },
                include: { perks: true }
            }), 31556952),
            getCachedData(`typeTops`, () => prisma.tops.findMany({ where: { hidden: { not: true } } }), 31556952),
            getCachedData(`accEmojis`, () => prisma.accountType.findMany({
                where: {
                    dependencyPriorityAcc: null,
                    emoji: { not: null }
                },
                select: { emoji: true, name: true }
            }), 31556952),
            getCachedData(`allowedNumberOfImg_${accType}`, () => prisma.accountType.findFirst({
                where: { name: accType },
                select: { numberOfAllowedImages: true }
            }), 31556952)
        ]);




       
        } catch (dbError) {
            throw new Error("Chyba při načítání kategorií  a sekcí na /addPost - přidání příspěvku : " + dbError.message);
        }
        let filteredTypeTops 
        let ableForTops = accPriority > 1
        if(ableForTops){
             filteredTypeTops = typeTops.filter(top => top.numberOfMonthsToValid <= accMonthIn);
           // console.log(filteredTypeTops);
        }
       

        return (
            <div>
           
                    <>
                        <div id='scrollHereAddPost' style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
                            <ul style={{ paddingLeft: "15px", marginBottom: "20px" }} className="steps isolate">
                                <li className="step step-primary firstStep">Vyberte typ inzerátu</li>
                                <li className="step secondStep">Vytvořit inzerát</li>
                            </ul>
                        </div>
                        {!session.isLoggedIn &&
                        <div
    style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}
  >
    <Link
      className="btn  btn-md"
      href={""}
      onClick={openLoginModal}
    >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
</svg>

      Přihlásit se
     
    </Link>
  </div>
  }
                        <div
                        
  style={{
    marginBottom: "40px",
  
    position: "relative", // Umožňuje absolutní pozicování vnořených prvků
  }}
  className={`typeOfPosts flex flex-col md:flex-row items-center justify-center gap-2 p-2`}
>
  


    {typeofPosts
    .sort((a, b) => a.priority - b.priority) // Řazení podle priority

    .filter(post => post.show === true)  // Filtrovat pouze příspěvky s show: true
    .map((post) => {
        // Zkontrolujeme, zda je nějaký post s show: false a shoduje se s accType
        const matchingPostWithFalseShow = typeofPosts.find(
            (p) => p.show === false && p.name === accType&& post.priority <= 1
        );
      
        // Pokud nalezneme příspěvek s show: false a odpovídá accType, použijeme jeho perks
        const perksToUse = matchingPostWithFalseShow
            ? matchingPostWithFalseShow.perks
            : post.perks; // Pokud není shodný post, použijeme perks původního postu

        return (
            <Post
                isLogged={session.isLoggedIn}
                allTops={typeTops}
                priority={post.priority}
                allowedTops={ableForTops&& post.priority <= 1? filteredTypeTops : false}
                key={post.id}
                hasThisType={accType}
                name={post.name}
                emoji={post.priority <= 1 ? accEmojis : []}
                benefits={perksToUse.map((perk) => [perk.name, perk.valid])} // Použijeme upravené perks
            />
        );
    })}
      
        </div>
                        

                        <div className='addPostSecondStep' style={{ display: "none" }}>
                            <AddUI categories={CategoriesFromDb} sections={SectionsFromDb} allImgCount={allowedNumberOfImg} />
                        </div>
                    </>
               
            </div>
        );
    } catch (error) {

      console.log(error)
      try{


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
          info: 'Chyba na /addPost',
          errorPrinted: error,
          dateAndTime: dateAndTime,
          userId: session?.userId,
          ipAddress:ip,}
        })
      } catch(error){

      }
       return<> <div className="p-4 text-center">
          <h1 className="text-xl font-bold mt-2">
          <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-12 h-12 mx-auto text-red-500 mb-2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17L6.765 20.823a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"
          />
        </svg>
            Nastala chyba
            <br />
           <Link  className="btn mt-2" href={"/"}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
</svg>
</Link>
          </h1>
        </div>
        </>
    }finally {
        await prisma.$disconnect(); // Uzavřete připojení po dokončení
    }
};

export default Page;