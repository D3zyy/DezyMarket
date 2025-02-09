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

    // Přidáme podmínku pro topování pouze tehdy, když je aktivní sekce
    const sectionFilter = section ? { AllTops: true } : {};

    // Začátek měření času
    console.time('fetchPosts');

    // Načteme příspěvky s prioritizací podle toho, zda se filtruje podle sekce
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
            top: true,
        },
        orderBy: section
            ? [
                { AllTops: 'desc' }, // Topované příspěvky se berou jen pokud mají AllTops === true
                { top: { numberOfMonthsToValid: 'desc' } }, // Seřazení podle počtu měsíců topování
                { dateAndTime: 'desc' } // Ostatní příspěvky podle data
            ]
            : [
                { top: { numberOfMonthsToValid: 'desc' } }, // Normální řazení bez filtru sekce
                { topId: 'desc' },
                { dateAndTime: 'desc' }
            ],
        skip: (page - 1) * pageSize,
        take: pageSize,
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

    // Konec měření času
    console.timeEnd('fetchPosts');

    return new Response(
        JSON.stringify({ posts, total: totalPosts }),
        {
            headers: { 'Content-Type': 'application/json' }
        }
    );
}