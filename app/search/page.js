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
        // `price` nebude aplikováno do dotazu v SQL, pokud není specifikováno
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
            // Pokud je cena jedna z těchto hodnot, bude se filtrovat přímo v DB
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

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPosts.map((post) => (
                <Post key={post.id} postDetails={post} />
            ))}
        </div>
    )
}

export default page;