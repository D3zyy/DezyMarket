"use client"
import Link from 'next/link';
import React, { useState, useRef } from 'react'

function SearchComponent() {
  const [isLoadingSearch, setIsLoadingSearch] = useState(false); 
  const [foundData, setFoundData] = useState([]); 
  const searchTimeout = useRef(null); // useRef pro zajištění, že timeout je uchován mezi renderováními

  const searchUser = async (info) => {
    if(info.length > 0) {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current); // Pokud je aktivní timeout, zrušíme ho
      }

      searchTimeout.current = setTimeout(async () => { // Spustí se až po určitém zpoždění
        setIsLoadingSearch(true); // Nastavení loading stavu na true
        try {
          const response = await fetch('/api/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              searchQuery: info,
            }),
          });

          const result = await response.json();
          
          // Ujistíme se, že result je pole
          setFoundData(Array.isArray(result.data) ? result.data : []);
        } catch (error) {
          console.error('Chyba získávání uživatele', error);
        } finally {
          setIsLoadingSearch(false); // Po dokončení nebo chybě, nastavíme loading na false
        }
      }, 1000); // 500 ms zpoždění
    } else {
      setFoundData([]); // Pokud je searchQuery prázdné, resetujeme výsledky
    }
  };

  return (
    <div className="relative">
      <label className="input input-bordered flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="h-4 w-4 opacity-70"
        >
          <path
            fillRule="evenodd"
            d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
            clipRule="evenodd"
          />
        </svg>
        <input
  type="text"
  className="grow"
  onChange={(e) => {
    const value = e.target.value;
    if (value.length >= 2) {
      searchUser(value);
    }
  }}
  placeholder="Vyhledat.."
/>
      </label>

      {/* Dropdown pro výsledky */}
      {isLoadingSearch ? (
        <div className="absolute left-0 bg-base-300 right-0 shadow-md mt-1">
          <p className=" flex p-2"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
</svg>
Hledám...</p>
        </div>
      ) : (
        foundData.length > 0 && (
          <div className="absolute left-0 right-0 bg-base-300   shadow-md mt-1 max-h-60 overflow-y-auto">
            {foundData?.map((post, index) => (
              <Link  href={'/'}>
             
              <div key={index} className="p-2 hover:bg-base-200">
                <h3 dangerouslySetInnerHTML={{ __html: post.name }} className="font-semibold" />
                <p dangerouslySetInnerHTML={{ __html: post.description }} className="text-sm text-gray-600" />
              </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}

export default SearchComponent;