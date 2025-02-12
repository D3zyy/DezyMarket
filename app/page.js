import React from 'react'
import { prisma } from './database/db';
import localFont from 'next/font/local';
import Link from 'next/link';
import SearchComponent from './components/SearchComponent';
import { Suspense } from 'react';
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
 
  try{ 

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

     <div className='items-center mx-auto max-w-[300px]    rounded-md p-4'>
     <Suspense>
     <SearchComponent categories={categories} displaySections={false} />
     </Suspense>
     </div>
    
          <div className="flex justify-center items-center mx-auto border-2 border-dotted max-w-[300px]  md:max-w-[800px] border-gray-900  rounded-md p-4 ">
           
            <div className="grid grid-cols-1 md:grid-cols-4  gap-4 ml-14">
              {categories.map((category) => (
                <div key={category.id} className="p-2  rounded-md ">
                  <h2 className="text-lg font-bold  flex  gap-2 ">
                    <Link href={`/search?category=${category.name}`} className='underline'>{category.name}</Link>
                
                    <span dangerouslySetInnerHTML={{ __html: category.logo }}></span>
                  </h2>
                  <ul className="">
                    {category.sections.map((section) => (
                     <li  key={section.id}>   <Link   href={`/search?category=${category.name}&section=${section.name}`} className='underline text-sm'>{section.name}</Link> </li>
        
                    ))}
                  </ul>
                </div>
              ))}
     
          </div>
    
      </div>

      </> );
  } catch (error) {
    return (
      <div className="p-4 text-center">
        <h1 className="text-xl font-bold mt-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-red-500 mb-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
  </svg>
  
          Nastala  chyba
          <br />
        
        </h1>
      </div>
    );} finally {
      await prisma.$disconnect(); // Uzavřete připojení po dokončení
    }
};

export default Page;