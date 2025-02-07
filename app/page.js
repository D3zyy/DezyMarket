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

      <div  className={`  flex flex-col gap-2 md:flex-row justify-center font-bold sticky md:static mdtop-0   top-4  p-2 rounded-lg max-w-[300px] md:max-w-[600px] mx-auto  mt-2  mb-2 `}>
      <SearchComponent />
      </div> 
      <div className="flex flex-col gap-2 md:flex-row justify-center font-bold md:static md:top-0 p-2 rounded-lg max-w-[300px] md:max-w-[600px] mx-auto mt-2 mb-2">
          <select className="select select-bordered">
            <option disabled selected>Kategorie</option>
            <option>Sci-fi</option>
            <option>Drama</option>
            <option>Action</option>
          </select>
          <select className="select select-bordered">
            <option disabled selected>Sekce</option>
            <option>Sci-fi</option>
            <option>Drama</option>
            <option>Action</option>
          </select>
          <select className="select select-bordered">
            <option disabled selected>Lokace</option>
            <option>Sci-fi</option>
            <option>Drama</option>
            <option>Action</option>
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