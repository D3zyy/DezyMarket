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
    
const emoji1 = `<div class='badge badge-lg badge-secondary badge-outline' style='color: #c792e9; border-color: #c792e9;'>${process.env.BEST_RANK}</div>`;
const emoji2 = `<div class='badge badge-lg badge-secondary badge-outline' style='color: #ff7d5c; border-color: #ff7d5c;'>${process.env.MEDIUM_RANK}</div>`;
const emoji3 = `<div class='badge badge-outline'>${process.env.BASE_RANK}</div>`;
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
             <h3 style={{ textAlign: "center", fontSize: "large", fontWeight: "bold" }}>
                  Zvolte typ účtu, který vám sedí
                </h3>
          </>
          )}
<div style={{marginBottom:"40px"}} className="flex flex-col md:flex-row items-center justify-center gap-2 p-2">


<Account
  hasThisType={accType}
  name="Profík"
  emoji={emoji1} // První účet
  price={98}
  priceId={"price_1PzMcUHvhgFZWc3Hb6o7RPbk"}
  benefits={[
    ["Neomezený počet inzerátů", true],
    ["až 25 fotografií u inzerátu", true],
    ["Profík inzerát", true],
    ["Statistika zobrazení inzerátu", true],
    ["Topování na hlavní stránce", true],
    ["Topování v kategorii", true],
    ["Odznáček vedle jména", true],
    ["Prioritní zákaznická podpora", true],
  ]}
/>

<Account
  hasThisType={accType}
  name="Šikula"
  emoji={emoji2} // Druhý účet
  price={88}
  priceId={"price_1PuH84HvhgFZWc3HGd8JElE1"}
  benefits={[
    ["Neomezený počet inzerátů ", true],
    ["až 20 fotografie u inzerátu", true],
    ["Šikula inzerát", true],
    ["Topování v kategorii", true],
    ["Odznáček vedle jména", true],
    ["Prioritní zákaznická podpora", true],
    ["Topování na hlavní stránce", false],
    ["Statistika zobrazení inzerátu", false],
  ]}
/>

<Account
  hasThisType={accType}
  name="Základní"
  emoji={""} // Třetí účet
  price={0}
  priceId={""}
  benefits={[
    ["Neomezený počet inzerátů", true],
    ["až 25 fotografií u inzerátu", true],
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