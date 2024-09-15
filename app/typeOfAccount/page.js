import React from 'react';
import { getSession } from '../authentication/actions';
import NotLoggedIn from '../components/NotLoggedIn';
import { redirect } from 'next/navigation';
import Account from './Account'; // Import Account properly
import Link from 'next/link';
import { getUserAccountType, getUserAccountTypeOnStripe } from './Methods';

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
          ) : (
            <h3 style={{ textAlign: "center", fontSize: "large", fontWeight: "bold" }}>
              Zvolte typ účtu, který vám sedí..
            </h3>
          )}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 p-4">
            <Account
              hasThisType={accType}
              name="Základní"
              emoji=""
              price={0}
              priceId={""}
              benefits={[
                ["Služba <Link href='/DezySafety'> DezySafety ochrana kupujícího i prodavajícího</Link>", true],
                ["1 fotka u inzerátu", true],
                ["Pouze 3 inzeráty za měsíc", true],
                ["Doporučované v kategorii", false],
                ["Doporučované na hlavní stránce", false],
                ["Přednost při řešení sporu", false],
                ["Stránky bez reklam", false],
              ]}
            />
            <Account
              hasThisType={accType}
              name="Šikula"
              emoji="&#129303;"
              price={88}
              priceId={"price_1PuH84HvhgFZWc3HGd8JElE1"}
              benefits={[
                ["Služba <Link href='/DezySafety'> DezySafety ochrana kupujícího i prodavajícího</Link>", true],
                ["10 inzerátů za měsíc", true],
                ["až 3 fotky u inzerátu", true],
                ["Doporučované v kategorii", true],
                ["Přednost při řešení sporu", true],
                ["Doporučované na hlavní stránce", false],
                ["Stránky bez reklam", false],
              ]}
            />
            <Account
              hasThisType={accType}
              name="Profík"
              emoji="&#129321;"
              price={128}
              priceId={"price_1PuH8JHvhgFZWc3Hdme1WQUf"}
              benefits={[
                ["Služba <Link href='/DezySafety'> DezySafety ochrana kupujícího i prodavajícího</Link>", true],
                ["Neomezený počet inzerátů za měsíc", true],
                ["až 10 fotek u inzerátu", true],
                ["Doporučované v kategorii", true],
                ["Doporučované na hlavní stránce", true],
                ["Přednost při řešení sporu", true],
                ["Stránky bez reklam", true],
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