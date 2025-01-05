require('dotenv').config();  // Načítání proměnných prostředí z .env souboru
const { DateTime } = require('luxon');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const { execSync } = require('child_process');

async function main() {
  // 0) Získání seznamu všech tabulek v databázi
  console.log("Vymazání databáze a resetování identity...");
  execSync('npx prisma migrate reset --force');
  console.log('Všechna data byla vymazána a identity byly resetovány!');

  // 2) Spuštění Prisma příkazů: generate a db push
  console.log("Spuštění Prisma generate...");
  execSync('npx prisma generate'); // Generuje Prisma klienta

  console.log("Spuštění Prisma db push...");
  execSync('npx prisma db push'); // Synchronizuje schéma s databází

  // 3) Inicializace rolí
  console.log("Inicializace rolí...");
  const Roles = [
    { name: 'uzivatel', privileges: 1 },
    { name: 'admin', privileges: 2 },
    { name: 'spravce', privileges: 3 },
    { name: 'majitel', privileges: 4 }
  ];

  for (const role of Roles) {
    await prisma.roles.create({
      data: {
        name: role.name,
        privileges: role.privileges,
      },
    });
  }

  // 4) Inicializace typů účtů
  console.log("Inicializace typů účtů...");
  // vždy u předplatného zdarma u toho base předplatného musí být priority 1
  const accountTypes = [
    { 
      name: 'Základní', 
      priority: 1, 
      priceAmountCZKMonthly: "0", 
      perks: [
        ["Neomezený počet inzerátů", true],
        ["až 15 fotografií u inzerátu", true],
        ["Základní typ inzerátu", true],
        ["Topování na hlavní stránce", false],
        ["Topování v kategorii", false],
        ["Statistika zobrazení inzerátu", false],
        ["Odznáček vedle jména", false],
        ["Prioritní zákaznická podpora", false]
      ]
    },
    { 
      name: 'Šikula', 
      priority: 2, 
      emoji: `<div class="badge badge-lg badge-secondary badge-outline" style="color: #ff7d5c; border-color: #ff7d5c;">Šikula</div>`,
      priceAmountCZKMonthly: "134", 
      perks: [
        ["Neomezený počet inzerátů", true],
        ["až 20 fotografie u inzerátu", true],
        ["Šikula inzerát", true],
        ["Topování v kategorii", true],
        ["Odznáček vedle jména", true],
        ["Prioritní zákaznická podpora", true],
        ["Topování na hlavní stránce", false],
        ["Statistika zobrazení inzerátu", false]
      ]
    },
    { 
      name: 'Profík', 
      emoji: `<div class='badge badge-lg badge-secondary badge-outline' style='color: #c792e9; border-color: #c792e9;'>Profík</div>`,
      priority: 3, 
      priceAmountCZKMonthly: "152", 
      perks: [
        ["Neomezený počet inzerátů", true],
        ["až 25 fotografií u inzerátu", true],
        ["Profík inzerát", true],
        ["Statistika zobrazení inzerátu", true],
        ["Topování na hlavní stránce", true],
        ["Topování v kategorii", true],
        ["Odznáček vedle jména", true],
        ["Prioritní zákaznická podpora", true]
      ]
    },{ 
      name: 'MegaMan', 
      emoji: `<div class='badge badge-lg badge-secondary badge-outline' style='color: #13bd40; border-color: #13bd40; '>MegaMan</div>`,
      priority: 4, 
      priceAmountCZKMonthly: "251", 
      perks: [
        ["Neomezený počet inzerátů", true],
        ["až 25 fotografií u inzerátu", true],
        ["Profík inzerát", true],
        ["Statistika zobrazení inzerátu", true],
        ["Topování na hlavní stránce", true],
        ["Topování v kategorii", true],
        ["Odznáček vedle jména", true],
        ["Prioritní zákaznická podpora", true]
      ]
    }
  ];
  for (const accountType of accountTypes) {
    // Create the AccountType record
    const accId = await prisma.AccountType.create({
      data: {
        emoji: accountType.emoji,
        name: accountType.name,
        priority: accountType.priority,
      },
    });
  
    // Insert the perks for the created AccountType
    const perksData = accountType.perks.map(perk => ({
      name: perk[0],
      valid: perk[1],
      accId: accId.id,  // Foreign key reference to the created AccountType
    }));
  
    // Create the perks associated with the AccountType
    await prisma.PerksAccount.createMany({
      data: perksData,
    });
  }


  const postTypes = [
    { 
      name: 'Základní', 
      priority: 1, 
      perks: [
        ["až 15 fotografií u inzerátu", true],
        ["Doba uložení ař 2 měsíce", true],
        ["Počet zobrazení inzerátu", true],
        ["Topovaný v kategorii", true],
        ["Kdo si zobrazil inzerát", false],
        ["Topovaný v sekci", false],
      ]
    },
    { 
      name: 'Šikula', 
      priority: 2, 
      priceAmountCZKMonthly: "88", 
      perks: [
        ["až 20 fotografií u inzerátu", true],
        ["Doba uložení až 3 měsíce", true],
        ["Počet zobrazení inzerátu", true],
        ["Kdo si zobrazil inzerát", true],
        ["Topovaný v kategorii", true],
        ["Topovaný v sekci", true],
      ]
    },
    { 
      name: 'Profík', 
      priority: 3, 
      priceAmountCZKMonthly: "98", 
      perks: [
        ["až 25 fotografií u inzerátu", true],
        ["Doba uložení až 4 měsíce", true],
        ["Počet zobrazení inzerátu", true],
        ["Kdo si zobrazil inzerát", false],
        ["Topovaný v kategorii", false],
        ["Topovaný v sekci", false],
      ]
    }
  ];


  // Loop through postTypes to create entries in the PostType table
for (const postType of postTypes) {
    // Create a new PostType
    const postTypeId = await prisma.PostType.create({
      data: {
        name: postType.name,
      },
    });
  
    // Insert the perks for the created PostType
    const perksData = postType.perks.map(perk => ({
      name: perk[0],
      valid: perk[1],
      postTypeId: postTypeId.id,  // Foreign key reference to the created PostType
    }));
  
    // Create the perks associated with the PostType
    await prisma.PerksPost.createMany({
      data: perksData,
    });
  }





  const Tops = [
    { 
      name: 'Top',  
      emoji: '&#128204;',
      color: '#ba3d42', // Neutrální barva pro základní top
      numberOfMonthsToValid: 1,
      hidden: false,
    },
    { 
      name: 'Top+', 
      emoji: '&#128171;',
      color: '#f0f018', // Světlejší šedá pro Top+
      numberOfMonthsToValid: 2,
      hidden: false,
    },
    { 
      name: 'Premium Top', 
      emoji: '&#128142;', // Chilli emoji
      color: '#05abab', // Červená pro spicy
      numberOfMonthsToValid: 4,
      hidden: false,
    },
    { 
      name: 'Spicy Top', 
      emoji: '&#127798;', // Symbol peněz pro deluxe
      color: '#ff2200', // Zlatá/žlutá pro luxus
      numberOfMonthsToValid: 6,
      hidden: false,
    },
    { 
      name: 'Fire Top', 
      emoji: '&#128293;', // Raketa pro Ultra
      color: '#ff7738', // Modrá pro ultramoderní vzhled
      numberOfMonthsToValid: 9,
      hidden: false,
    },
    { 
      name: 'Ultimate Top', 
      emoji: '&#128640;', // Hvězda pro Supreme
      color: '#ff8c00', // Oranžová pro "supreme"
      numberOfMonthsToValid: 12,
      hidden: true,
    },
    { 
      name: 'Legendary Top', 
      emoji: '&#127879', // Koruna pro King
      color: '#d9a891', // Zlatá pro "king"
      numberOfMonthsToValid: 24,
      hidden: true,
    }
  ];
  for (const top of Tops) {
    await prisma.Tops.create({
      data: {
        name: top.name,
        emoji: top.emoji,
        color: top.color,
        numberOfMonthsToValid: top.numberOfMonthsToValid,
        hidden: top.hidden,
      },
    });
  }
// Nejprve definuj kategorie
const categories = [
    { name: 'Auta', logo: '&#x1F697;' },  // 🚗
    { name: 'Elektronika', logo: '&#x1F4BB;' },  // 💻
    { name: 'Práce', logo: '&#x1F4BC;' },  // 💼
    { name: 'Oblečení', logo: '&#x1F457;' },  // 👗
    { name: 'Mobily', logo: '&#x1F4F1;' },  // 📱
    { name: 'Počítače', logo: '&#x1F4BB;' },  // 💻
    { name: 'Zahrada', logo: '&#x1F33F;' },  // 🌿
    { name: 'Sport', logo: '&#x26BD;' },  // ⚽
    { name: 'Knihy', logo: '&#x1F4D6;' },  // 📚
    { name: 'Hračky', logo: '&#x1F9F8;' },  // 🧸
    { name: 'Nábytek', logo: '&#x1F6CB;' },  // 🛋️
    { name: 'Jídlo', logo: '&#x1F35D;' },  // 🍝
    { name: 'Bazar', logo: '&#x1F4E6;' },  // 📦
    { name: 'Hobby', logo: '&#x1F3A4;' },  // 🎤
    { name: 'Zvířata', logo: '&#x1F43E;' },  // 🐾
    { name: 'Cestování', logo: '&#x2708;' },  // ✈️
    { name: 'Dům', logo: '&#x1F3E1;' },  // 🏠
    { name: 'Zdraví', logo: '&#x1F489;' },  // 💉
    { name: 'Auto-moto', logo: '&#x1F697;' },  // 🚗
    { name: 'Dětské zboží', logo: '&#x1F6B6;' },  // 🚶‍♂️
    { name: 'Kancelář', logo: '&#x1F4BC;' },  // 💼
    { name: 'Móda', logo: '&#x1F457;' },  // 👗
    { name: 'Služby', logo: '&#x1F3E0;' },  // 🏠
    { name: 'Kultura', logo: '&#x1F3AD;' },  // 🎭
    { name: 'Různé', logo: '&#x1F3C6;' },  // 🏆
    { name: 'Ostatní', logo: '&#x1F6A7;' },  // 🚧
    { name: 'Věda', logo: '&#x1F52C;' },  // 🔬
    { name: 'Vzdělání', logo: '&#x1F4D6;' },  // 📚
    { name: 'Elektrokola', logo: '&#x1F6B2;' },  // 🚲
  ];
  
  // Vytvoř kategorie v databázi
  const createdCategories = await prisma.categories.createMany({
    data: categories.map(category => ({
      name: category.name,
      logo: category.logo,
    })),
  });
  
  // Sekce, které budou vytvořeny po získání ID kategorií
  const sections = [
    { name: 'BMW', categoryName: 'Auta' },
    { name: 'Audi', categoryName: 'Auta' },
    { name: 'Porsche', categoryName: 'Auta' },
    { name: 'Tesla', categoryName: 'Auta' },
    { name: 'Ford', categoryName: 'Auta' },
    { name: 'Chevrolet', categoryName: 'Auta' },
    { name: 'BMW i3', categoryName: 'Auta' },
    { name: 'Mercedes', categoryName: 'Auta' },
    { name: 'Toyota', categoryName: 'Auta' },
    { name: 'Honda', categoryName: 'Auta' },
  
    { name: 'Notebooky', categoryName: 'Elektronika' },
    { name: 'Telefony', categoryName: 'Elektronika' },
    { name: 'Televize', categoryName: 'Elektronika' },
    { name: 'Kamera', categoryName: 'Elektronika' },
    { name: 'Sluchátka', categoryName: 'Elektronika' },
    { name: 'Domácí kino', categoryName: 'Elektronika' },
    { name: 'PC komponenty', categoryName: 'Elektronika' },
    { name: 'Herna zařízení', categoryName: 'Elektronika' },
    { name: 'Chytré hodinky', categoryName: 'Elektronika' },
    { name: 'Chytrý dům', categoryName: 'Elektronika' },
  
    { name: 'Realitní inzerce', categoryName: 'Práce' },
    { name: 'Inzerce pracovních nabídek', categoryName: 'Práce' },
    { name: 'Volná místa', categoryName: 'Práce' },
    { name: 'Poradenství', categoryName: 'Práce' },
    { name: 'Brigády', categoryName: 'Práce' },
    { name: 'Úřad práce', categoryName: 'Práce' },
    { name: 'Freelance', categoryName: 'Práce' },
    { name: 'Work-life balance', categoryName: 'Práce' },
    { name: 'Dohody', categoryName: 'Práce' },
    { name: 'Fyzické práce', categoryName: 'Práce' },
  
    { name: 'Pánská móda', categoryName: 'Oblečení' },
    { name: 'Dámská móda', categoryName: 'Oblečení' },
    { name: 'Sportovní oblečení', categoryName: 'Oblečení' },
    { name: 'Léto', categoryName: 'Oblečení' },
    { name: 'Zimní oblečení', categoryName: 'Oblečení' },
    { name: 'Luxusní móda', categoryName: 'Oblečení' },
    { name: 'Teplákové soupravy', categoryName: 'Oblečení' },
    { name: 'Doplňky', categoryName: 'Oblečení' },
    { name: 'Obuv', categoryName: 'Oblečení' },
    { name: 'Móda pro děti', categoryName: 'Oblečení' },
  
    { name: 'Android', categoryName: 'Mobily' },
    { name: 'iPhone', categoryName: 'Mobily' },
    { name: 'Samsung', categoryName: 'Mobily' },
    { name: 'Huawei', categoryName: 'Mobily' },
    { name: 'Xiaomi', categoryName: 'Mobily' },
    { name: 'Sony', categoryName: 'Mobily' },
    { name: 'Nokia', categoryName: 'Mobily' },
    { name: 'Motorola', categoryName: 'Mobily' },
    { name: 'Google Pixel', categoryName: 'Mobily' },
    { name: 'Mobilní příslušenství', categoryName: 'Mobily' },
  ];
  
  // Získání všech kategorií z DB
  const allCategories = await prisma.categories.findMany();
  
  // Vytvoření sekcí
  for (const section of sections) {
    // Najdeme správnou kategorii podle názvu
    const category = allCategories.find(cat => cat.name === section.categoryName);
  
    if (category) {
      // Vytvoření sekce s přiřazeným categoryId
      await prisma.sections.create({
        data: {
          name: section.name,
          categoryId: category.id,  // Použijeme ID kategorie z DB
        },
      });
    }
  }
  // 5) Vytváření produktů a cen na Stripe
  console.log("Vytváření produktů a cen na Stripe...");
  for (const accountType of accountTypes) {
    try {
      if (accountType.priority === 1) {
        // Pokud má prioritu 1, přidáme pouze do databáze, ne na Stripe
        const createdPrice = await prisma.prices.create({
          data: {
            value: parseInt(accountType.priceAmountCZKMonthly),
            priceCode: null,  // Pro tento účet nemáme cenu na Stripe
          },
        });

        const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");

        const accountTypeRecord = await prisma.AccountType.findFirst({
          where: { name: accountType.name },
        });

        await prisma.AccountTypeOnPrices.create({
          data: {
            priceId: createdPrice.id,
            activeFrom: dateAndTime,
            accountTypeId: accountTypeRecord.id,
          },
        });

        console.log(`Účet "${accountType.name}" (priorita 1) byl přidán pouze do databáze s cenou 0.`);
      } else {
        // Pro účty s jinou prioritou
        // 1. Zkontroluj, zda produkt na Stripe existuje
        const existingProducts = await stripe.products.list();
        let productId = null;
        let existingPrice = null;

        // Najdi produkt podle názvu
        const product = existingProducts.data.find(p => p.name === accountType.name);

        if (product) {
          // Pokud produkt existuje, získej ID produktu
          productId = product.id;

          // Zkontroluj ceny produktu na Stripe
          const prices = await stripe.prices.list({ product: productId });
          existingPrice = prices.data.find(price => price.currency === 'czk');

          if (existingPrice) {
            // Pokud cena existuje a je jiná než požadovaná
            
          } else {
            // Pokud cena pro produkt neexistuje, vytvoř ji
            console.log(`Produkt "${accountType.name}" nemá cenu na Stripe. Vytváříme novou cenu.`);
            const price = await stripe.prices.create({
                unit_amount: parseInt(accountType.priceAmountCZKMonthly) * 100, // Cena v haléřích (CZK * 100)
                currency: 'czk', // Měna
                product: productId, // ID produktu na Stripe
                recurring: {
                  interval: 'month', // Interval platby (měsíčně)
                },
              });
              
           
            console.log(`Cena pro produkt "${accountType.name}" byla přidána na Stripe.`);
          }
        } else {
          // Pokud produkt neexistuje, vytvoř nový produkt na Stripe
          const newProduct = await stripe.products.create({
            name: accountType.name,
          });

          productId = newProduct.id;
          console.log(`Produkt "${accountType.name}" byl vytvořen na Stripe.`);
        }

        // Vytvoř novou cenu v databázi
        const price = await stripe.prices.create({
          unit_amount: parseInt(accountType.priceAmountCZKMonthly) * 100,  // Cena v haléřích (CZK * 100)
          currency: 'czk',  // Měna
          product: productId,  // ID produktu na Stripe
          recurring: {
            interval: 'month',  // Interval platby (měsíčně)
          },
        });

        const createdPrice = await prisma.prices.create({
          data: {
            value: parseInt(accountType.priceAmountCZKMonthly),
            priceCode: price.id,
          },
        });

        const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");

        const accountTypeRecord = await prisma.AccountType.findFirst({
          where: { name: accountType.name },
        });

        await prisma.AccountTypeOnPrices.create({
          data: {
            priceId: createdPrice.id,
            activeFrom: dateAndTime,
            accountTypeId: accountTypeRecord.id,
          },
        });

        console.log(`Produkt "${accountType.name}" byl přidán na Stripe a cena byla aktualizována.`);
      }
    } catch (error) {
      console.error("Chyba při vytváření produktu a ceny na Stripe:", error);
    }
  }

  console.log('Inicializace byla úspěšná!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });