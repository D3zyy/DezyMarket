import { prisma } from '../../database/db';
import { checkRateLimit } from '@/app/RateLimiter/rateLimit';
import { getSession } from '@/app/authentication/actions';
import { getCachedData } from '@/app/getSetCachedData/caching';
export async function POST(request) {
    try {
    const ipToRedis =
    request.headers.get("x-forwarded-for")?.split(",")[0] || 
    request.headers.get("x-real-ip") ||                     
                                   null;
                         
                                 const ipCheck = ipToRedis?.startsWith("::ffff:") ? ipToRedis.replace("::ffff:", "") : ipToRedis;
                             const rateLimitStatus = await checkRateLimit(ipCheck);
                         
                             if (!rateLimitStatus.allowed) {
                                 return new Response(JSON.stringify({
                                     message: "Příliš mnoho požadavků"
                                 }), {
                                     status: 403,
                                     headers: { 'Content-Type': 'application/json' }
                                 });
                             }
    
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
    let posts = await getCachedData(
        `posts_filter_${JSON.stringify(filters)}_keyWord_${keyWord}_price_${price}_page_${page}_section_${section}`, // Unikátní klíč pro cache
        async () => await prisma.posts.findMany({
          where: {
            ...filters,
            OR: keyWord
              ? [
                  { name: { search: `${keyWord}:*` } },
                  { description: { search: `${keyWord}:*` } }
                ]
              : undefined,
           
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
        }),
        300 // Cache expirace na 5 minut (300 sekund)
      );

    let totalPosts = await getCachedData(
        `total_posts_filter_${JSON.stringify(filters)}_keyWord_${keyWord}_price_${price}_section_${section}`, // Unikátní klíč pro cache
        async () => await prisma.posts.count({
          where: {
            ...filters,
            OR: keyWord
              ? [
                  { name: { search: `${keyWord}:*` } },
                  { description: { search: `${keyWord}:*` } }
                ]
              : undefined,
        
          }
        }),
        300 // Cache expirace na 5 minut (300 sekund)
      );

      console.log("Před našel sem příspěvky:",posts)
      if (price && !["Dohodou", "V textu", "Zdarma"].includes(price)) {
        const isNumeric = (value) => /^\d+$/.test(value);
  
        // Aplikujeme filtr na ceny až po načtení příspěvků
        posts = posts.filter((post) => {
          if (!isNumeric(post.price)) return false; // Odstraní nečíselné ceny
  
          const numericPrice = Number(post.price); // Převod na číslo
  
          if (price.includes("-")) {
            console.log(1)
            const [min, max] = price.split("-").map(Number);
            console.log("TOGLE vracím:", numericPrice >= min && numericPrice <= max)
            return numericPrice >= min && numericPrice <= max;
          } else if (price.endsWith("+")) {
            console.log(2)
            const min = Number(price.replace("+", ""));
            return numericPrice >= min;
          } else {
            console.log(3)
            return numericPrice === Number(price);
          }
        });
      } else if (price && ["Dohodou", "V textu", "Zdarma"].includes(price)) {
        // Pokud je cena jedna z hodnot 'Dohodou', 'Vtextu' nebo 'Zdarma', filtrujeme přímo v DB
        posts = posts.filter((post) => post.price === price);
  
      }
      console.log("Po filtraci:",posts)

    // Konec měření času
    console.timeEnd('fetchPosts');
    const filteredPosts = posts.map(post => ({
        id: post.id,
        name: post.name,
        location: post.location,
        top: post.top,
        images: post.images,
        AllTops: post.AllTops,
        price: post.price
    }));
    
    
    return new Response(
        JSON.stringify({ posts: filteredPosts, total: totalPosts }),
        {
            headers: { 'Content-Type': 'application/json' }
        }
    );
     } catch (error) {
          
            try{
            
              const rawIp =
              request.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
              request.headers.get("x-real-ip") ||                      // Alternativní hlavička
              request.socket?.remoteAddress ||                         // Lokální fallback
              null;
            
            // Odstranění případného prefixu ::ffff:
            const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
            
                const session =await getSession()
            
                  const dateAndTime = DateTime.now()
                  .setZone('Europe/Prague')
                  .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
                    await prisma.errors.create({ data: {
                      info: `Chyba na /api/getPosts - POST - (catch) keyWord: ${data.keyWord},  category: ${data.category}  section: ${data.section} price: ${data.price} location: ${data.location} page: ${page}   `,
                      dateAndTime: dateAndTime,
                      errorPrinted: error,
                      userId: session?.userId,
                      ipAddress:ip },
                    })
        
                  }catch(error){}
              console.error('Chyba na serveru [POST] požadavek informace o předplatném:  ', error);
              return new NextResponse(JSON.stringify({
                  message: 'Chyba na serveru [POST] požadavek informace o předplatném'
              }), {
                  status: 500,
                  headers: { 'Content-Type': 'application/json' }
              });
          }finally {
            await prisma.$disconnect(); // Uzavřete připojení po dokončení
      }
}