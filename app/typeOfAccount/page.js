import React from 'react';
import { getSession } from '../authentication/actions';
import NotLoggedIn from '../components/NotLoggedIn';
import { redirect } from 'next/navigation';
import Account from './Account'; // Import Account properly
import Link from 'next/link';
import {  getUserAccountTypeOnStripe } from './Methods';

const Page = async ({ searchParams }) => {
  const session = await getSession();
  const successMessage = searchParams?.success; // Get the 'success' parameter from searchParams

  let accType = await getUserAccountTypeOnStripe(session.email);

  if (!session.isLoggedIn) redirect('/');

  return (
    <div>
      {session.isLoggedIn ? (
        <>
          {successMessage ? (
         <div
        
      style={{
        display: 'flex',
        justifyContent: 'center', // Center horizontally
        alignItems: 'center', // Center vertically if needed
        padding: '20px', // Add padding around the content
      }}
    >
      <div
        className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-200 dark:bg-gray-800 dark:text-green-400"
        role="alert"
        style={{
          display: 'flex',
          alignItems: 'center', // Align items vertically
          gap: '10px', // Space between icon and text
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2} // Increase stroke width for bold effect
          stroke="currentColor"
          className="w-6 h-6"
          style={{
            strokeWidth: '2.5', // Make stroke bold
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
        <span className="font-bold">Úspěch!</span> Vaše předplatné bylo aktivováno.
      </div>
    </div>
          ) : (<>
            {accType ? (
              accType === "Základní" ? (
                <>
                  <h3 style={{ textAlign: "center", fontSize: "large", fontWeight: "bold" }}>
                    Zvolte typ účtu, který vám sedí
                  </h3>
                  <h1 style={{ textAlign: "center", fontSize: "small", padding: "25px" }}>
                    ..naše služby jsou zpoplatněny abychom potlačili riziko podvodníků a zajistili Vám tak bezpečné prostředí pro Vaše inzeráty.
                  </h1>
                </>
              ) : null
            ) : (
              <>
                <h3 style={{ textAlign: "center", fontSize: "large", fontWeight: "bold" }}>
                  Zvolte typ účtu, který vám sedí
                </h3>
                <h1 style={{ textAlign: "center", fontSize: "small", padding: "25px" }}>
                  ..naše služby jsou zpoplatněny abychom potlačili riziko podvodníků a zajistili Vám tak bezpečné prostředí pro Vaše inzeráty.
                </h1>
              </>
            )}
          </>
          )}
<div style={{marginBottom:"40px"}} className="flex flex-col md:flex-row items-center justify-center gap-2 p-2">
  <Account
    hasThisType={accType}
    name=""
    emoji="<div class='badge badge-lg badge-secondary badge-outline' style='color: #ff7d5c; border-color: #ff7d5c;'>Šikula</div>"
    price={88}
    priceId={"price_1PuH84HvhgFZWc3HGd8JElE1"}
    benefits={[
      ["Neomezený počet inzerátů ", true],
      ["až 3 fotky u inzerátu", true],
      ["Všechny typy inzerátu", true],
      ["Topování v kategorii", true],
      ["Odznáček vedle jména", true],
      ["Prioritní zákaznická podpora", true],
      ["Topování na hlavní stránce", false],
      ["Statistika zobrazení inzerátu", false],
    ]}
    
  />
  <Account
    hasThisType={accType}
    name=""
    emoji="<div class='badge badge-lg badge-secondary badge-outline' style='color: #c792e9; border-color: #c792e9;'>Profík</div>"
    price={98}
    priceId={"price_1PzMcUHvhgFZWc3Hb6o7RPbk"}
    benefits={[
      ["Neomezený počet inzerátů", true],
      ["až 5 fotek u inzerátu", true],
      ["Všechny typy inzerátu", true],
      ["Statistika zobrazení inzerátu", true],
      ["Topování na hlavní stránce", true],
      ["Topování v kategorii", true],
      ["Odznáček vedle jména", true],
      ["Prioritní zákaznická podpora", true],
    ]}
  />
  <Account
    hasThisType={accType}
    name=""
    emoji="<div class='badge badge-outline'>Základní</div>"
    price={0}
    priceId={""}
    benefits={[
      ["Pouze 5 inzerátů", true],
      ["1 fotka u inzerátu", true],
      ["Základní typ inzerátu", true],
      ["Topování na hlavní stránce", false],
      ["Topování v kategorii", false],
      ["Statistika zobrazení inzerátu", false],
      ["Odznáček vedle jména", false],
      ["Prioritní zákaznická podpora", false],
    ]}
    className="order-last md:order-none" // Přidejte třídu pro mobilní zařízení
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