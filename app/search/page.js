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

    console.log("filters:", filters)

    // Načteme všechny příspěvky podle parametrů
    let filteredPosts = await prisma.posts.findMany({
        where: {
            ...filters,
            OR: keyWord
                ? [
                    { name: { search: `${keyWord}:*` } },
                    { description: { search: `${keyWord}:*` } }
                  ]
                : undefined
        },
        include: {
            images: {
                take: 1 
            }
        }
    })

    // Aplikujeme filtr ceny až po načtení příspěvků
    if (price) {
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