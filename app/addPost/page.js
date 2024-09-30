import { redirect } from 'next/navigation';
import React from 'react';
import { getSession } from '../authentication/actions';
import NotLoggedIn from '../components/NotLoggedIn';
import { getUserAccountTypeOnStripe } from '../typeOfAccount/Methods';
import Account from '../typeOfAccount/Account';
import Post from './post';
import AddUI from './AddUI';
import { prisma } from '../database/db';



const Page = async () => {
    const session = await getSession();

    let accType = await getUserAccountTypeOnStripe(session.email);



    if (!accType && session.isLoggedIn) {
           await redirect('/typeOfAccount');
    }
    let CategoriesFromDb = await prisma.Categories.findMany({});
    console.log(CategoriesFromDb)

    let userCategories = await prisma.userCategories.findMany({
        where: {
          userId: session.userId,
        },
        include: {
          category: {
            select: {
              name: true,
              logo: true,
            },
          },
        },
      });

     


    return (
        <div>
                {session.isLoggedIn ? (
                    <>
                <div
                    style={{
                    display: 'flex',
                    justifyContent: 'center', // Center horizontally
                    alignItems: 'center', // Center vertically if needed
                    padding: '10px', // Add padding around the content
                    }}>

                    <ul style={{paddingLeft: "15px",marginBottom: "20px"}} className="steps isolate">
                            <li className="step step-primary firstStep">Vyberte typ inzerátu</li>
                            <li className="step secondStep">Vytvořit inzerát</li>
                    </ul>
                </div>
         <div  style={{marginBottom:"40px"}} className="typeOfPosts flex flex-col md:flex-row items-center justify-center gap-2 p-2">
       
        <Post 
    hasThisType={accType}
    name={
        accType === process.env.BASE_RANK
          ? 'Topovaný'
          : accType === process.env.MEDIUM_RANK
          ? process.env.MEDIUM_RANK
          : accType === process.env.BEST_RANK
          ? process.env.BEST_RANK
          : ''
      }
    emoji={
    accType === process.env.BASE_RANK
    ? "<div class='badge badge-lg badge-secondary badge-outline' style='color: #ff7d5c; border-color: #ff7d5c;'>Šikula</div> <div class='badge badge-lg badge-secondary badge-outline' style='color: #c792e9; border-color: #c792e9;'>Profík</div>"
    : accType === process.env.MEDIUM_RANK
    ? "<div class='badge badge-lg badge-secondary badge-outline' style='color: #ff7d5c; border-color: #ff7d5c;'>Šikula</div> "
    : accType === process.env.BEST_RANK
    ? " <div class='badge badge-lg badge-secondary badge-outline' style='color: #c792e9; border-color: #c792e9;'>Profík</div>"
    : ''
    }
    price={
        accType === process.env.BASE_RANK
        ? 28
        : accType === process.env.MEDIUM_RANK
        ? 0
        : accType === process.env.BEST_RANK
        ? 0
        : 28


    }
    priceId={"price_1PzMcUHvhgFZWc3Hb6o7RPbk"}
    benefits={[
        [accType === process.env.BASE_RANK
            ? "X fotografií"
            : accType === process.env.MEDIUM_RANK
            ? "3 obrázky"
            : accType === process.env.BEST_RANK
            ? "10 obrázků"
            : "X obrázků"
            , true],
        [
          accType === process.env.BASE_RANK
            ? "Doba uložení 2 měsíce"
            : accType === process.env.MEDIUM_RANK
            ? "Doba uložení 3 měsíce"
            : accType === process.env.BEST_RANK
            ? "Doba uložení 4 měsíce"
            : "Doba uložení X měsíce"
            , true],
        ["Topovaný v kategorii ", true],
        ["Statistika zobrazení inzerátu", true],
        ["Topovaný na hlavní stránce", accType === process.env.BASE_RANK
            ? true
            : accType === process.env.MEDIUM_RANK
            ? false
            : accType === process.env.BEST_RANK
            ? process.env.BEST_RANK
            : true],

    ]}
 
  />
     
   <Post
    hasThisType={accType}
    name={process.env.BASE_RANK}
    emoji=""
    price={0}
    priceId={"price_1PuH84HvhgFZWc3HGd8JElE1"}
    benefits={[
      ["5 obrázků ", true],
      ["Doba uložení 2 měsíce", true],
      ["Topovaný v kategorii ", false],
      ["Topovaný na hlavní stránce", false],
      ["Statistika zobrazení inzerátu", false],
    ]}
  />

 </div>
 


         
<div className='addPostSecondStep' style={{display: "none"}}>
     <AddUI accType={accType}  userCategories={userCategories} categories={CategoriesFromDb}/>
</div> 


            </>
               
                
            ) : (
                <NotLoggedIn />
            )}
        </div>
    );
};

export default Page;