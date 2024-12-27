import React from 'react';
import { getSession } from '../authentication/actions';
import NotLoggedIn from '../components/NotLoggedIn';
import { redirect } from 'next/navigation';
import Account from './Account'; // Import Account properly
import Link from 'next/link';
import {  getUserAccountTypeOnStripe,getTypeOfAccountDetails } from './Methods';

const Page = async ({ searchParams }) => {
  const session = await getSession();
  
  const redirectStatus = searchParams.redirect_status // Get 'redirect_status' directly from searchParams
  const successMessage = redirectStatus === 'succeeded'; // Check for success
  const upgradeMessage = redirectStatus === 'upgraded'; // Check for success
  const failureMessage = redirectStatus === 'failed'; // Check for failure
  const unknownMessage = redirectStatus && redirectStatus !== 'succeeded' && redirectStatus !== 'failed' && redirectStatus !=="upgraded"; // Check for unknown status
  const noStatusMessage = !redirectStatus; // Check if no status is provided

  let accTypeOfUser = await getUserAccountTypeOnStripe(session.email);
  let acctypes = await getTypeOfAccountDetails();

  
  if (typeof acctypes === "string") {
    acctypes = JSON.parse(acctypes);
  }
  const sortedAcctypes = acctypes?.slice().sort((a, b) => b.priority - a.priority);
console.log(sortedAcctypes)
  
  if(accTypeOfUser?.length == 1){
    accTypeOfUser = accTypeOfUser[0]
  } 

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
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
          }}
        >
          <div
            className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-200 dark:bg-gray-800 dark:text-green-400"
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
              style={{
                strokeWidth: '2.5',
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
      ) : failureMessage ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
          }}
        >
          <div
            className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-200 dark:bg-gray-800 dark:text-red-400"
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
              style={{
                strokeWidth: '2.5',
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span className="font-bold">Chyba!</span> Platba se nezdařila. Zkuste to znovu.
          </div>
        </div>
      ) : unknownMessage ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
          }}
        >
          <div
            className="p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-200 dark:bg-gray-800 dark:text-yellow-400"
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
</svg>

            <span className="font-bold">Neznámý stav!</span> Stav platby není rozpoznán.
          </div>
        </div>
      ): upgradeMessage ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
          }}
        >
          <div
            className="p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-200 dark:bg-gray-800 dark:text-yellow-400"
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
</svg>


            <span className="font-bold">Upgrade!</span>Úspěšně jste upgradovali předplatné.
          </div>
        </div>
      ) : noStatusMessage ? (
        <h3
          style={{
            textAlign: "center",
            fontSize: "large",
            fontWeight: "bold",
          }}
        >
          Zvolte typ účtu, který vám sedí
        </h3>
      ) : null}
<div style={{marginBottom:"40px"}} className="flex flex-col md:flex-row items-center justify-center gap-2 p-2">


{sortedAcctypes?.map(accType => (
  
  <Account
    key={accType.id}
    hasThisType={accTypeOfUser}
    emoji={accType.emoji}
    name={accType.name}
    price={accType.activePrice || 0}
    priceId={accType.accPrices[0]?.priceCode || ''}
    benefits={accType.perks.map(perk => [perk.name, perk.valid])}
    className={accType.priority === 1 ? 'order-last md:order-none' : ''}
  />
))}

</div>

        </>
      ) : (
        <NotLoggedIn />
      )}
    </div>
  );
};

export default Page;