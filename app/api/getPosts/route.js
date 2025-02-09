import { prisma } from '../../database/db';

export async function POST(request) {
    const { keyWord, category, section, price, location, page = 1 } = await request.json();
    const pageSize = 9; // Počet příspěvků na stránku

    // Filtry pro ostatní parametry
    const filters = {
        ...(category && { category: { is: { name: category } } }),
        ...(section && { section: { is: { name: section } } }),
        ...(location && { location }),
    };

    // Načteme příspěvky s priorizací topovaných podle numberOfMonthsToValid
    const posts = await prisma.posts.findMany({
        where: {
            ...filters,
            OR: keyWord
                ? [
                    { name: { search: `${keyWord}:*` } },
                    { description: { search: `${keyWord}:*` } }
                ]
                : undefined,
            ...(price && (price === 'Dohodou' || price === 'V textu' || price === 'Zdarma') && { price })
        },
        include: {
            images: { take: 1 },
            top: true, // Připojení topování
        },
        orderBy: [
            { top: { numberOfMonthsToValid: 'desc' } }, // Nejvyšší numberOfMonthsToValid první
            { dateAndTime: 'desc' } // Ostatní seřadit podle data
        ],
        skip: (page - 1) * pageSize,  // Skip podle aktuální stránky
        take: pageSize,  // Načteme pouze "pageSize" příspěvků
    });

    // Získání celkového počtu příspěvků pro stránkování
    const totalPosts = await prisma.posts.count({
        where: {
            ...filters,
            OR: keyWord
                ? [
                    { name: { search: `${keyWord}:*` } },
                    { description: { search: `${keyWord}:*` } }
                ]
                : undefined,
            ...(price && (price === 'Dohodou' || price === 'V textu' || price === 'Zdarma') && { price })
        }
    });

    // Vracíme příspěvky a celkový počet pro klienta
    return new Response(
        JSON.stringify({ posts, total: totalPosts }),
        {
            headers: { 'Content-Type': 'application/json' }
        }
    );
}