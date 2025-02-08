import React from 'react'
import { prisma } from '../database/db'
import Post from './Post'

async function page({ searchParams }) {
    const { keyWord, category, section, price, location } = searchParams

    // Filtry pro zbytek parametrů
    const filters = {
        ...(category && { category: { is: { name: category } } }),
        ...(section && { section: { is: { name: section } } }),
        ...(location && { location }),
    }

    // Načteme příspěvky podle parametrů
    let filteredPosts = await prisma.posts.findMany({
        where: {
            ...filters,
            OR: keyWord
                ? [
                    { name: { search: `${keyWord}:*` } },
                    { description: { search: `${keyWord}:*` } }
                  ]
                : undefined,
            ...(price && (price === 'Dohodou' || price === 'Vtextu' || price === 'Zdarma') && { price })
        },
        include: {
            images: {
                take: 1 
            },
            top: true
        }
    })

    // Pokud je cena definována a není jednou z těchto hodnot, použijeme filtr až po načtení příspěvků
    if (price && !['Dohodou', 'Vtextu', 'Zdarma'].includes(price)) {
        const isNumeric = (value) => /^\d+$/.test(value);

        filteredPosts = filteredPosts.filter((post) => {
            if (!isNumeric(post.price)) return false; // Odstraní nečíselné ceny

            const numericPrice = Number(post.price); // Převod na číslo

            if (price.includes("-")) {
                const [min, max] = price.split("-").map(Number);
                return numericPrice >= min && numericPrice <= max;
            } else if (price.endsWith("+")) {
                const min = Number(price.replace("+", ""));
                return numericPrice >= min;
            } else {
                return numericPrice === Number(price);
            }
        });
    }

    console.log("Filtered posts with price:", filteredPosts);
    let sortedPosts
    if( filteredPosts?.length > 0){


     sortedPosts = filteredPosts?.sort((a, b) => {
        const aTopValue = a.top?.numberOfMonthsToValid ?? 0;
        const bTopValue = b.top?.numberOfMonthsToValid ?? 0;
        
        return bTopValue - aTopValue; // Seřadí od nejvyššího topu dolů
    });
}
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-2">
            {filteredPosts.length > 0 ? (
                sortedPosts?.map((post) => (
                    <Post key={post.id} postDetails={post} />
                ))
            ) : (
                <div className="flex  gap-2 items-center justify-center w-full col-span-full  text-center text-gray-500">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM13.5 10.5h-6" />
</svg>
    Žádné příspěvky nebyly nalezeny
                </div>
            )}
        </div>
    )
}

export default page;