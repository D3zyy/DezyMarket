import React from 'react'
import SearchComponent from '@/app/components/SearchComponent'
import localFont from 'next/font/local';

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
          <select className="select select-bordered">
            <option disabled selected>Kategorie</option>
            <option>Sci-fi</option>
            <option>Drama</option>
            <option>Action</option>
          </select>
          <select className="select select-bordered">
            <option disabled selected>Místo</option>
            <option>Sci-fi</option>
            <option>Drama</option>
            <option>Action</option>
          </select>
          <select className="select select-bordered">
            <option disabled selected>Cena</option>
            <option>Sci-fi</option>
            <option>Drama</option>
            <option>Action</option>
          </select>
     
      </div>     
       </div>

      {/* Obsah stránky */}
      <div className="mt-32">{children}</div>
    </div>
  )
}

export default Layout;