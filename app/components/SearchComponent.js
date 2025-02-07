"use client";
import Link from 'next/link';
import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

function SearchComponent({ categories }) {
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [foundData, setFoundData] = useState([]);
  const searchTimeout = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get('category') || "";
  const section = searchParams.get('section') || "";
  const location = searchParams.get('location') || "";
  const price = searchParams.get('price') || "";
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [selectedLocation, setSelectedLocation] = useState(location);
  const [selectedPrice, setSelectedPrice] = useState(price);
  function htmlToText(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString;
    return div.textContent || div.innerText || "";
  }
  const handleCategoryChange = (e) => {
    const selected = e.target.value;
    setSelectedCategory(selected);

    // Vytvoření URL s přidanými filtry (kategorie, místo, cena)
    const queryParams = new URLSearchParams();

    if (selected) queryParams.append('category', selected);
    if (selectedLocation) queryParams.append('location', selectedLocation);
    if (selectedPrice) queryParams.append('price', selectedPrice);

    // Přesměrování na URL s parametry
    router.push(`/search?${queryParams.toString()}`);
  };

  // Funkce pro změnu místa a přesměrování s ostatními filtry
  const handleLocationChange = (e) => {
    const selected = e.target.value;
    setSelectedLocation(selected);

    const queryParams = new URLSearchParams();

    if (selectedCategory) queryParams.append('category', selectedCategory);
    if (selected) queryParams.append('location', selected);
    if (selectedPrice) queryParams.append('price', selectedPrice);

    router.push(`/search?${queryParams.toString()}`);
  };

  // Funkce pro změnu ceny a přesměrování s ostatními filtry
  const handlePriceChange = (e) => {
    const selected = e.target.value;
    setSelectedPrice(selected);

    const queryParams = new URLSearchParams();

    if (selectedCategory) queryParams.append('category', selectedCategory);
    if (selectedLocation) queryParams.append('location', selectedLocation);
    if (selected) queryParams.append('price', selected);

    router.push(`/search?${queryParams.toString()}`);
  };



  const searchUser = async (info) => {
    setIsLoadingSearch(true);
    if (info.length >= 2) {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
      setFoundData([]);
      searchTimeout.current = setTimeout(async () => {
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
          setFoundData(Array.isArray(result.data) ? result.data : []);
        } catch (error) {
          console.error('Chyba získávání uživatele', error);
        } finally {
          setIsLoadingSearch(false);
        }
      }, 1000);
    } else {
      setFoundData([]);
    }
  };

  const closeSearchResults = () => {
    setFoundData([]); // Zavře výsledky hledání
    setSearchQuery(""); // Resetuje text v inputu
  };

  useEffect(() => {
    setSelectedCategory(category);
    setSelectedLocation(location);
    setSelectedPrice(price);
  }, [category, location, price]);

  return (
    <>
      <div className="relative">
        <label className="input input-bordered flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 opacity-70">
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
              setSearchQuery(value);
              if (value.length >= 2) {
                searchUser(value);
              } else {
                setFoundData([]);
              }
            }}
            placeholder="Vyhledat.."
            value={searchQuery}
          />
        </label>

        {isLoadingSearch ? (
          <></>
        ) : (
          foundData.length > 0 ? (
            <div className="absolute left-0 right-0 rounded-lg bg-base-200 shadow-md mt-1 max-h-60 overflow-y-auto">
              {foundData.map((post, index) => (
                <Link 
  key={index} 
  href={`/search?keyWord=${post.fullWord}${selectedCategory ? `&category=${selectedCategory}` : ''}${selectedLocation ? `&location=${selectedLocation}` : ''}${selectedPrice ? `&price=${selectedPrice}` : ''}`} 
  onClick={closeSearchResults}
>
                  <div className="p-2 hover:bg-base-300">
                    <h3 dangerouslySetInnerHTML={{ __html: post.name }} className="font-semibold" />
                  </div>
                </Link>
              ))}
            </div>
          ) : !isLoadingSearch && searchQuery.length >= 2 && (
            <div className="absolute left-0 right-0 bg-base-300 shadow-md mt-1 p-2 text-gray-500">
              <p className='flex gap-2'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM13.5 10.5h-6" />
                </svg>
                Nenalezeno
              </p>
            </div>
          )
        )}
      </div>

      <div className="flex flex-col gap-2 md:flex-row justify-center font-bold md:static p-2 rounded-lg max-w-[300px] md:max-w-[600px] mx-auto mt-2 mb-1">
      <select
      className="md:max-w-[130px] select select-bordered"
      onChange={handleCategoryChange}
      value={selectedCategory}
    >
      {/* Pokud není vybraná kategorie, zobrazí se možnost "Kategorie" */}
      {!selectedCategory && <option value="">Kategorie</option>}
      
      {categories?.map((cat) => (
        <option key={cat.id} value={cat.name}>
       {htmlToText(cat.logo)} {cat.name}
        </option>
      ))}
    </select>

        <select
          className="md:max-w-[150px] select select-bordered"
          value={selectedLocation}
          onChange={handleLocationChange}
        >
          <option value="">Místo</option>
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
            <option key={location.id} value={location.name}  selected={selectedLocation == location.name}  >
              {location.name}
            </option>
          ))}
        </select>

        <select
          className="md:max-w-[120px] select select-bordered"
          value={selectedPrice}
          onChange={handlePriceChange}
        >
          <option   value="">Cena</option>
          <option  selected={selectedPrice == 'Dohodou'}    value="Dohodou">Dohodou</option>
          <option  selected={selectedPrice == 'Vtextu'}    value="V textu">V textu</option>
          <option selected={selectedPrice == 'Zdarma'}   value="Zdarma">Zdarma</option>
          <option selected={selectedPrice == '1-500'}   value="1-500">1-500 Kč</option>
          <option selected={selectedPrice == '500-5000'}  value="500-5000">500-5 000 Kč</option>
          <option selected={selectedPrice == '5000-50000'}  value="5000-50000">5 000-50 000 Kč</option>
          <option selected={selectedPrice == '50000+'}  value="50000+">50 000+</option>
        </select>
      </div>
    </>
  );
}

export default SearchComponent;