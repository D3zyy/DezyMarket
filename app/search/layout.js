import React, { Suspense } from "react";
import SearchComponent from "@/app/components/SearchComponent";
import localFont from "next/font/local";
import { prisma } from "../database/db";
import { headers } from "next/headers"; // Získání URL requestu
import Link from "next/link";
// Správné cesty k fontům (musí být v /public/fonts/)
const pacifico = localFont({
  src: "/../../public/fonts/Pacifico/Pacifico-Regular.ttf",
  weight: "400",
  style: "normal",
});

const bebas = localFont({
  src: "/../../public/fonts/Bebas_Neue/BebasNeue-Regular.ttf",
  weight: "400",
  style: "normal",
});

async function Layout({ children  }) {
try{
  const categories = await prisma.categories.findMany({
    include: { sections: true },
  });

  return (
    <div>
 <div className="flex flex-col items-center w-full p-4">
        <h1 className={`${bebas.className} text-4xl font-bold`}> <Link href={'/'}>Dezy</Link></h1>
        <span className={`${pacifico.className} text-lg font-semibold mt-1 mb-4`}>
          „Lepší místo pro vaše inzeráty.“
        </span>

        <Suspense>   
        <SearchComponent categories={categories} displaySections={true} />
           </Suspense>
       
    

       
      </div>

      {/* Obsah stránky */}
      <div className="mt-16">{children}</div>
    </div>
  
  ); 
 } catch (error) {
    return (
      <div className="p-4 text-center">
        <h1 className="text-xl font-bold mt-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-red-500 mb-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
  </svg>
  
          Nastala  chyba
          <br />
         <Link  className="btn mt-2" href={"/"}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
  </Link>
        </h1>
      </div>
    );} finally {
      await prisma.$disconnect(); // Uzavřete připojení po dokončení
    }

}

export default Layout;