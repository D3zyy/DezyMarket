import React from 'react'
import { prisma } from './database/db';
import localFont from 'next/font/local';

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

      <div  className={`  flex justify-center font-bold sticky md:static top-0   p-2 rounded-lg  max-w-[600px] mx-auto mt-2 mb-2 `}>
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
  <input type="text" className="grow " placeholder="Vyhledat.." />
  
</label>
      </div>

          <div className="flex justify-center items-center mx-auto border-2 border-dotted max-w-[300px]  md:max-w-[800px] border-gray-900  rounded-md p-4 ">
            <div className="grid grid-cols-1 md:grid-cols-4  gap-4 ml-14">
              {categories.map((category) => (
                <div key={category.id} className="p-2  rounded-md ">
                  <h2 className="text-lg font-bold  flex  gap-2 ">
                  <span className='underline'> {category.name} </span> 
                    <span dangerouslySetInnerHTML={{ __html: category.logo }}></span>
                  </h2>
                  <ul className="">
                    {category.sections.map((section) => (
                      <li key={section.id} className="text-sm underline">{section.name}</li>
                    ))}
                  </ul>
                </div>
              ))}
     
          </div>
    
      </div>

      </> );
  } catch (e) {
    console.error("Chyba při načítání dat:", e);
    return <div className="flex items-center justify-center min-h-screen">Chyba při načítání dat.</div>;
  }
};

export default Page;