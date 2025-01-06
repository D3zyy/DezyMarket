import React from 'react';
import { getSession } from '../authentication/actions';
import NotLoggedIn from '../components/NotLoggedIn';
import { redirect } from 'next/navigation';
import Account from './Account'; // Import Account properly
import Link from 'next/link';
import {  getUserAccountTypeOnStripe,getTypeOfAccountDetails } from './Methods';
import { prisma } from '../database/db';

const Page = async ({ searchParams }) => {
  const session = await getSession();
  
  const redirectStatus = searchParams.redirect_status // Get 'redirect_status' directly from searchParams
  const successMessage = redirectStatus === 'succeeded'; // Check for success
  const upgradeMessage = redirectStatus === 'upgraded'; // Check for success
  const failureMessage = redirectStatus === 'failed'; // Check for failure
  const unknownMessage = redirectStatus && redirectStatus !== 'succeeded' && redirectStatus !== 'failed' && redirectStatus !=="upgraded"; // Check for unknown status
  const noStatusMessage = !redirectStatus; // Check if no status is provided

  let [accTypeOfUser, acctypes,typeOfTops] = await Promise.all([
    getUserAccountTypeOnStripe(session.email),
    getTypeOfAccountDetails(),
     prisma.Tops.findMany({}),
  ]);
  

  if (typeof acctypes === "string") {
    acctypes = JSON.parse(acctypes);
  }
  const sortedAcctypes = acctypes?.slice().sort((a, b) => b.priority - a.priority);
  console.log(accTypeOfUser)


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
      <>   { accTypeOfUser?.priority === 1 &&  <h3
        style={{
          textAlign: "center",
          fontSize: "large",
          fontWeight: "bold",
        }}
      >
      
      </h3>}</>
       
      ) : null}


<h3
  className="mt-5 mb-2 font-bold italic"
  style={{
    textAlign: "center",
    fontSize: "large",
  }}
>
  
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="size-9"
    style={{
      display: "inline-block",
      verticalAlign: "middle",
    }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
    />
  </svg>
</h3>

<h3 className='font-normal mb-3 flex justify-center items-center'>

  {

    // Zkontroluje, zda existuje účet, který splňuje podmínky
    sortedAcctypes?.some(accType => accType?.name === accTypeOfUser?.name && accType.priority !== 1) ? (
      sortedAcctypes?.map((accType) => (
        accType?.name === accTypeOfUser?.name && accType.priority !== 0 ? (
          <React.Fragment key={accType.name + accType.priority}>
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-2 ">
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
</svg>
   <span className='font-normal text-center mr-2 ' dangerouslySetInnerHTML={{ __html: accType.emoji }}></span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-2">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
</svg>
   {` ${accTypeOfUser?.monthIn}. měsíc` }
   
          </React.Fragment>
        ) : null
      ))
    ) : (
      <>
       
        {sortedAcctypes?.map((accType) => (
          accType.priority !== 1 ? (
            <span key={accType.name + accType.priority} className='font-normal text-center mr-2 mt-2' dangerouslySetInnerHTML={{ __html: accType.emoji }}></span>
          ) : null
        ))}
      </>
    )
  }
</h3>

  <div className='text-center'> 
 



  <ul className="steps mb-3 flex flex-wrap lg:flex-row justify-center ">
  {typeOfTops
    .filter((top) => !top.hidden) 
    .sort((a, b) => a.numberOfMonthsToValid - b.numberOfMonthsToValid) // Seřazení podle počtu měsíců
    .map((top) => {
      const isPrimary = accTypeOfUser?.monthIn >= top.numberOfMonthsToValid;
      const borderColor = isPrimary ? '#b0b0b0' : '#e0e0e0';
      const backgroundColor = isPrimary ? '#f5f5f5' : '#fafafa';
      const textColor = isPrimary ? '#757575' : '#b0b0b0';
      const lockColor = isPrimary ? '#00d390' : '#b0b0b0';

      const maxValidMonths = Math.max(
        ...typeOfTops
          .filter((top) => accTypeOfUser?.monthIn >= top.numberOfMonthsToValid)
          .map((top) => top.numberOfMonthsToValid)
      );

      const isMostAdvanced =
        top.numberOfMonthsToValid === maxValidMonths &&
        accTypeOfUser?.monthIn >= top.numberOfMonthsToValid &&
        accTypeOfUser?.priority !== 1;

      return (
        <li
          key={top.id}
          style={{
            opacity: isPrimary && accTypeOfUser?.priority !== 1 ? 1 : 0.8,
          }}
          className={`border-2 border-solid rounded-[12px] p-[6px_10px] inline-flex flex-col items-center justify-center m-[5px] w-[120px] opacity-100 
        ${isPrimary && accTypeOfUser?.priority !== 1 ? 'bg-[#f5f5f5] text-[#757575]' : 'bg-[#fafafa] text-[#b0b0b0]'}
        ${isMostAdvanced ? 'dark:border-[#111010] border-[#686666]' : ''} 
        dark:border-[#2a2828] dark:bg-[#333333] dark:text-[#9b9a9a] dark:opacity-90`}
        >
          <div
            dangerouslySetInnerHTML={{ __html: top.emoji }}
            style={{
              fontSize: '18px',
              marginBottom: '5px',
              filter: isPrimary && accTypeOfUser?.priority !== 1 ? 'none' : 'blur(1px)',
            }}
          />
          <div
            style={{
              fontSize: '12px',
              textAlign: 'center',
              filter: isPrimary && accTypeOfUser?.priority !== 1 ? 'none' : 'blur(1px)',
            }}
          >
            {top.name} <br />
          </div>
          <span
            style={{
              marginTop: '5px',
              color: lockColor,
              fontSize: '20px',
            }}
          >
            {isPrimary && accTypeOfUser?.priority !== 1 ? (
              <></>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6 dark:text-[#f9f7f7] text-[#494949]"
                style={{ width: '24px', height: '24px' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                />
              </svg>
            )}
          </span>
          {top.numberOfMonthsToValid}. měsíc
        </li>
      );
    })}
</ul>






  </div>

<div style={{marginBottom:"40px"}} className="flex flex-col md:flex-row items-center justify-center gap-2 p-2">


{sortedAcctypes?.map(accType => (
    
  <Account
    key={accType.id}
    hasThisType={accTypeOfUser?.name}
    emoji={accType.emoji}
    name={accType.name}
    price={accType.activePrice || 0}
    priceId={accType.accPrices[0]?.priceCode || ''}
    benefits={accType.perks.map(perk => [perk.name, perk.valid])}
    hasThisTypePriority={accTypeOfUser?.priority}
    namePriority={accType.priority}
    gifted={accTypeOfUser.gifted}
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