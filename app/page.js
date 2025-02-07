import React from 'react'
import { prisma } from './database/db';
import localFont from 'next/font/local';
import Link from 'next/link';
import SearchComponent from './components/SearchComponent';
const pacifico = localFont({
  src: '../public/fonts/Pacifico/Pacifico-Regular.ttf', // Začíná lomítkem
  weight: '400',
  style: 'normal',
});

const bebas = localFont({
  src: '../public/fonts/Bebas_Neue/BebasNeue-Regular.ttf', // Začíná lomítkem
  weight: '400',
  style: 'normal',
});

const Page = async () => {
 
  

  try {
    const categories = await prisma.categories.findMany({
      include: {
        sections: true,
      },
    });




    return (<>         
      <div  className={`${bebas.className} flex justify-center text-4xl font-bold   p-2  `}>
      <h1>Dezy</h1>
      </div>
      <div className="flex justify-center text-lg font-bold   p-2">
      <span
          className={pacifico.className}
        >
          „Lepší místo pro vaše inzeráty.“
        </span>
      </div>

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

          <div className="flex justify-center items-center mx-auto border-2 border-dotted max-w-[300px]  md:max-w-[800px] border-gray-900  rounded-md p-4 ">
            <div className="grid grid-cols-1 md:grid-cols-4  gap-4 ml-14">
              {categories.map((category) => (
                <div key={category.id} className="p-2  rounded-md ">
                  <h2 className="text-lg font-bold  flex  gap-2 ">
                    <Link href={`/category?categoryName=${category.name}`} className='underline'>{category.name}</Link>
                
                    <span dangerouslySetInnerHTML={{ __html: category.logo }}></span>
                  </h2>
                  <ul className="">
                    {category.sections.map((section) => (
                     <li  key={section.id}>   <Link   href={`/section?categoryName=${category.name}&sectionName=${section.name}`} className='underline text-sm'>{section.name}</Link> </li>
        
                    ))}
                  </ul>
                </div>
              ))}
     
          </div>
    
      </div>

      </> );
  } catch (e) {
    console.error("Chyba při načítání dat:", e);
    return <div className="flex items-center justify-center min-h-screen">Nastala chyba.</div>;
  }
};

export default Page;