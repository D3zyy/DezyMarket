import React from 'react'
import { prisma } from './database/db';

const Page = async () => {
  try {
    const categories = await prisma.categories.findMany({
      include: {
        sections: true,
      },
    });

    return (<>         
      <div className="flex justify-center text-2xl font-bold   p-2">
      <h1>Dezy</h1>
      </div>


     

          <div className="flex justify-center items-center mx-auto border-2 border-dotted max-w-[300px]  md:max-w-[800px] border-gray-900  rounded-md p-4 ">
            <div className="grid grid-cols-1 md:grid-cols-4  gap-4 ml-14">
              {categories.map((category) => (
                <div key={category.id} className="p-2  rounded-md ">
                  <h2 className="text-lg font-bold underline flex  gap-2 ">
                    {category.name} 
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