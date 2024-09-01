import React from 'react';
import { getSession } from '../authentication/actions';
import NotLoggedIn from '../components/NotLoggedIn';
import { redirect } from 'next/navigation';
import Account from './Account'; // Import Account properly
import Link from 'next/link';
import { getUserAccountType } from './Methods';




const Page = async () => {
  const session = await getSession();
  let accType = await getUserAccountType(session.userId)
  console.log("typ účtu: ",accType)


  if (!session.isLoggedIn) redirect('/');


  return (
    <div>
      {session.isLoggedIn ? (
        <>
          <h3 style={{ textAlign: "center", fontSize: "large", fontWeight: "bold" }}>
            Zvolte typ účtu, který vám sedí..
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 p-4">
            <Account
              hasThisType={accType}
              name="Základní"
              price={0}
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
              price={88}
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
              price={128}
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