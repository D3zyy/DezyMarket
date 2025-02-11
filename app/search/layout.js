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


}

export default Layout;