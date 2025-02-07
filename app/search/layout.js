import React from 'react'
import SearchComponent from '@/app/components/SearchComponent'
import localFont from 'next/font/local';
import { prisma } from '../database/db';

// Správné cesty k fontům (musí být v /public/fonts/)
const pacifico = localFont({
    src: '/../../public/fonts/Pacifico/Pacifico-Regular.ttf', // Začíná lomítkem
    weight: '400',
    style: 'normal',
  });
  
  const bebas = localFont({
    src: '/../../public/fonts/Bebas_Neue/BebasNeue-Regular.ttf', // Začíná lomítkem
    weight: '400',
    style: 'normal',
  });

  const categories = await prisma.categories.findMany({
    include: {
      sections: true,
    },
  });


function Layout({ children }) {
  return (
    <div>
      {/* Wrapper pro horní část */}
      <div className="fixed top-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center w-full z-10 p-4">
        
        {/* Nadpis */}
        <h1 className={`${bebas.className} text-4xl font-bold`}>Dezy</h1>
        
        {/* Slogan */}
        <span className={`${pacifico.className} text-lg font-semibold mt-1`}>
          „Lepší místo pro vaše inzeráty.“
        </span>

        {/* Vyhledávání + kategorie */}
        <div  className={`  flex flex-col gap-2 md:flex-row justify-center font-bold sticky md:static mdtop-0   top-4  p-2 rounded-lg max-w-[300px] md:max-w-[600px] mx-auto  mt-2  mb-1 `}>
      <SearchComponent />
      </div> 
      <div className="flex flex-col gap-2 md:flex-row justify-center font-bold md:static md:top-0 p-2 rounded-lg max-w-[300px] md:max-w-[600px] mx-auto mt-2 mb-1">
          <select className=" md:max-w-[130px] select select-bordered">
            <option  defaultChecked >Kategorie</option>
            {categories.map((category) => (
          <option key={category.id} value={category.id}>
             {category.name}
          </option>
        ))}
          </select>
          <select className=" md:max-w-[150px] select select-bordered">
            <option  defaultChecked>Místo</option>
            {[
      { id: "praha", name: "Praha" },
      { id: "brno", name: "Brno" },
      { id: "ostrava", name: "Ostrava" },
      { id: "olomouc", name: "Olomouc" },
      { id: "plzen", name: "Plzeň" },
      { id: "stredocesky_kraj", name: "Středočeský kraj" },
      { id: "jihocesky_kraj", name: "Jihočeský kraj" },
      { id: "plzensky_kraj", name: "Plzeňský kraj" },
      { id: "karlovarsky_kraj", name: "Karlovarský kraj" },
      { id: "ustecky_kraj", name: "Ústecký kraj" },
      { id: "liberecky_kraj", name: "Liberecký kraj" },
      { id: "kralovehradecky_kraj", name: "Královéhradecký kraj" },
      { id: "pardubicky_kraj", name: "Pardubický kraj" },
      { id: "jihomoravsky_kraj", name: "Jihomoravský kraj" },
      { id: "zlinsky_kraj", name: "Zlínský kraj" },
      { id: "olomoucky_kraj", name: "Olomoucký kraj" },
      { id: "moravskoslezsky_kraj", name: "Moravskoslezský kraj" },
      { id: "kraj_vysocina", name: "Kraj Vysočina" },
    ].map((location) => (
      <option key={location.id} value={location.name}>
        {location.name}
      </option>
    ))}
          </select>
          <select className=" md:max-w-[120px] select select-bordered">
            <option  defaultChecked>Cena</option>
            <option>Dohodou</option>
            <option>V textu</option>
            <option>Zdarma</option>
            <option>1-500 Kč</option>
            <option>500-5 000 Kč</option>
            <option>5 000-5 0000 Kč</option>
            <option>5 0000+</option>
          </select>
     
      </div>
</div>
      {/* Obsah stránky */}
      <div className="mt-32">{children}</div>
    </div>
  )
}

export default Layout;