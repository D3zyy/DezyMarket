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
import { openLoginModal } from '../components/modals/LoginModal';
const Page = async () => {
    let session
    let accType

    
            session = await getSession();
            if (!session) {
                throw new Error('Session nebyla nalezena');
            }
    
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
        [CategoriesFromDb, SectionsFromDb,typeofPosts,typeTops,accEmojis,allowedNumberOfImg] = (await Promise.allSettled([
            prisma.categories.findMany({}),
            prisma.sections.findMany({}),
            prisma.postType.findMany({
                where: {
                  OR: [
                    {
                      validFrom: { lte: dateAndTime }, // validFrom <= dateAndTime
                      validTo: { gte: dateAndTime }    // validTo >= dateAndTime
                    },
                    {
                      validFrom: null, // Zahrne případy, kdy validFrom není nastaveno
                      validTo: null    // Zahrne případy, kdy validTo není nastaveno
                    }
                  ]
                },
                include: {
                  perks: true // Zahrne všechny PerksPost patřící k danému PostType
                }
              }), 
               prisma.tops.findMany({ where: {
              
                hidden: { not: true } 
              
            },}),prisma.accountType.findMany({
                where: {
                    dependencyPriorityAcc: null, // Filtrovat pouze ty, které nemají žádnou závislost (null),
                    emoji: { not: null } ,
                  
                },
                select: {
                    emoji: true, // Získání pouze emoji pro tyto záznamy
                    name: true,
                    
                }
            }),prisma.accountType.findFirst({
                where: {
                    name:  accType
                  
                },
                select: {
                    numberOfAllowedImages: true, // Získání pouze emoji pro tyto záznamy
                    
                }
            })



          ])).map(result => result.status === 'fulfilled' ? result.value : null);
       
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
      className="btn btn-neutral btn-md"
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