"use client"
import React from 'react'
import { useState ,useRef} from 'react'

function SearchComponent() {

  const [isLoadingSearch, setIsLoadingSearch] = useState(false); 
  const [foundData, setFoundData] = useState([]); 
 const searchTimeout = useRef(null); // useRef pro zajištění, že timeout je uchován mezi renderováními



const searchUser = async (info) => {
  if(info.length   > 0){

 
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
      setFoundUsers(result?.users);
     

    } catch (error) {
      console.error('Chyba získávání uživatele', error);
    } finally {
      setIsLoadingSearch(false); // Po dokončení nebo chybě, nastavíme loading na false
    }
  }, 1000); // 500 ms zpoždění
} else {
 
}
};





  return (
    <label className="input input-bordered flex items-center  gap-2">
    <svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 16 16"
  fill="currentColor"
  className="h-4 w-4 opacity-70">
  <path
    fillRule="evenodd"
    d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
    clipRule="evenodd" />
</svg>
<input type="text" className="grow " onChange={(e) => (searchUser(e.target.value))} placeholder="Vyhledat.." />

</label>
  )
}

export default SearchComponent