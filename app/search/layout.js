import React from "react";
import SearchComponent from "@/app/components/SearchComponent";
import localFont from "next/font/local";
import { prisma } from "../database/db";
import { headers } from "next/headers"; // Získání URL requestu

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
      <div className="fixed top-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center w-full z-10 p-4">
        <h1 className={`${bebas.className} text-4xl font-bold`}>Dezy</h1>
        <span className={`${pacifico.className} text-lg font-semibold mt-1 mb-4`}>
          „Lepší místo pro vaše inzeráty.“
        </span>

        
          <SearchComponent categories={categories} />
    

       
      </div>

      {/* Obsah stránky */}
      <div className="mt-32">{children}</div>
    </div>
  );
}

export default Layout;