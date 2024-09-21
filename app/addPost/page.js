import { redirect } from 'next/navigation';
import React from 'react';
import { getSession } from '../authentication/actions';
import NotLoggedIn from '../components/NotLoggedIn';
import { getUserAccountTypeOnStripe } from '../typeOfAccount/Methods';
import Account from '../typeOfAccount/Account';

const Page = async () => {

    const session = await getSession();
    if (!session.isLoggedIn) redirect('/');
    let accType = await getUserAccountTypeOnStripe(session.email);
    console.log("Typ účtu na /AddPost:", accType);


    if (!accType) {
           await redirect('/typeOfAccount');
        }
    




    return (
        <div>
            {session.isLoggedIn ? (
                <>
        <div
            style={{
            display: 'flex',
            justifyContent: 'center', // Center horizontally
            alignItems: 'center', // Center vertically if needed
            padding: '20px', // Add padding around the content
            }}>

         <ul className="steps">
                <li className="step step-primary">Vyberte typ inzerátu</li>
                <li className="step ">Vytvořit inzerát</li>
         </ul>
         </div>
         <div style={{marginBottom:"40px"}} className="flex flex-col md:flex-row items-center justify-center gap-2 p-2">
  <Account
    hasThisType={accType}
    name="Základní"
    emoji=""
    price={0}
    priceId={"price_1PuH84HvhgFZWc3HGd8JElE1"}
    benefits={[
      ["1 fotka ", true],
      ["Topovaný v kategorii ", false],
      ["Topovaný na hlavní stránce", false],
      ["Statistika zobrazení inzerátu", false],
    ]}
  />
  <Account
    hasThisType={accType}
    name="Topovaný"
     emoji="<div class='badge badge-lg badge-secondary badge-outline' style='color: #ff7d5c; border-color: #ff7d5c;'>Šikula</div> <div class='badge badge-lg badge-secondary badge-outline' style='color: #c792e9; border-color: #c792e9;'>Profík</div>"
    price={28}
    priceId={"price_1PzMcUHvhgFZWc3Hb6o7RPbk"}
    benefits={[
        ["5 fotek", true],
        ["Topovaný v kategorii ", true],
        ["Topovaný na hlavní stránce", true],
        ["Statistika zobrazení inzerátu", true],
    ]}
  />
</div>
     
               
            </>
               
                
            ) : (
                <NotLoggedIn />
            )}
        </div>
    );
};

export default Page;