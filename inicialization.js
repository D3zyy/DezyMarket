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
      numberOfAllowedImages: 15,
      priceAmountCZKMonthly: "0", 
      perks: [
        ["Neomezený počet inzerátů", true],
        ["až 15 fotografií u inzerátu", true],
        ["Základní typ inzerátu", true],
        ["Topování v kategorii", false],
        ["Topování v sekci", false],
        ["Odznáček vedle jména", false],
        ["Prioritní zákaznická podpora", false]
      ]
    },
    { 
      name: 'Šikula', 
      priority: 2, 
      numberOfAllowedImages: 20,
      emoji: `<div class="badge badge-lg badge-secondary badge-outline" style="color: #ff7d5c; border-color: #ff7d5c;">Šikula</div>`,
      priceAmountCZKMonthly: "152", 
      perks: [
        ["Neomezený počet inzerátů", true],
        ["Neomezené topování", true],
        ["až 20 fotografie u inzerátu", true],
        ["Odznáček vedle jména", true],
        ["Topování v kategorii", true],
        ["Prioritní zákaznická podpora", true],
        ["Topování v sekci", false],

      ]
    },
    { 
      name: 'Profík',
      numberOfAllowedImages: 25, 
      emoji: `<div class='badge badge-lg badge-secondary badge-outline' style='color: #c792e9; border-color: #c792e9;'>Profík</div>`,
      priority: 3, 
      priceAmountCZKMonthly: "170", 
      perks: [
        ["Neomezený počet inzerátů", true],
        ["Neomezené topování", true],
        ["až 25 fotografií u inzerátu", true],
        ["Topování v kategorii", true],
        ["Topování v sekci", true],
        ["Odznáček vedle jména", true],
        ["Prioritní zákaznická podpora", true]
      ]
    }
  ];
  for (const accountType of accountTypes) {
    // Create the AccountType record
    const accId = await prisma.accountType.create({
      data: {
        emoji: accountType.emoji,
        name: accountType.name,
        priority: accountType.priority,
        numberOfAllowedImages: accountType.numberOfAllowedImages
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
      priority: 2, 
      show: true,
      perks: [
        ["až 15 fotografií u inzerátu", true],
        ["Doba uložení ař 2 měsíce", true],
        ["Počet zobrazení inzerátu", true],
        ["Topovaný v kategorii", false],
        ["Topovaný v sekci", false],
      ]
    },
    { 
      name: 'Topovaný', 
      priority: 1, 
      show: true,
      perks: [
        ["až X fotografií u inzerátu", true],
        ["Doba uložení až X měsíců", true],
        ["Počet zobrazení inzerátu", true],
        ["Topovaný v kategorii", true],
        ["Topovaný v sekci", true],
      ]
    },{ 
      name: 'Šikula', 
      perks: [
        ["až 20 fotografií u inzerátu", true],
        ["Doba uložení až 3 měsíce", true],
        ["Počet zobrazení inzerátu", true],
        ["Topovaný v kategorii", true],
        ["Topovaný v sekci", false],
      ]
    },
    { 
      name: 'Profík',
      perks: [
        ["až 25 fotografií u inzerátu", true],
        ["Doba uložení až 4 měsíce", true],
        ["Počet zobrazení inzerátu", true],
        ["Topovaný v kategorii", true],
        ["Topovaný v sekci", true],
      ]
    }
    
  ];


  // Loop through postTypes to create entries in the PostType table
for (const postType of postTypes) {
    // Create a new PostType
    const postTypeId = await prisma.PostType.create({
      data: {
        name: postType.name,
        priority: postType.priority,
        show: postType.show
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
    { name: 'Nemovitosti', logo: '&#x1F3E1;' },  // 🏠
    { name: 'Práce', logo: '&#x1F4BC;' },  // 💼
    { name: 'Mobily', logo: '&#x1F4F1;' },  // 📱
    { name: 'Počítače', logo: '&#x1F4BB;' },  // 💻
    { name: 'Elektronika', logo: '&#128421;' },  // 
    { name: 'Oblečení', logo: '&#x1F457;' },  // 👗
    { name: 'Zahrada', logo: '&#x1F33F;' },  // 🌿
    { name: 'Vstupenky', logo: '&#x1F39F;' },  // 🎟️
    { name: 'Knihy', logo: '&#x1F4D6;' },  // 📚
    { name: 'Hračky', logo: '&#x1F9F8;' },  // 🧸
    { name: 'Zvířata', logo: '&#x1F43E;' },  // 🐾
    { name: 'Vzdělání', logo: '&#x1F4D6;' },  // 📚
    { name: 'Kola', logo: '&#x1F6B2;' },  // 🚲
    { name: 'Ostatní', logo: '&#x1F6A7;' },  // 🚧
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
     // Počítače
     { name: 'Notebooky', categoryName: 'Počítače' },
     { name: 'Stolní počítače', categoryName: 'Počítače' },
     { name: 'PC komponenty', categoryName: 'Počítače' },
     { name: 'Monitory', categoryName: 'Počítače' },
     { name: 'Klávesnice', categoryName: 'Počítače' },
     { name: 'Myši', categoryName: 'Počítače' },
     { name: 'Tiskárny', categoryName: 'Počítače' },
     { name: 'Herní PC', categoryName: 'Počítače' },
     { name: 'Softwarové licence', categoryName: 'Počítače' },
     { name: 'Servery', categoryName: 'Počítače' },
     { name: 'Síťové prvky', categoryName: 'Počítače' },
     { name: 'Externí disky', categoryName: 'Počítače' },
     { name: 'USB flash disky', categoryName: 'Počítače' },
     { name: 'Ostatní počítače', categoryName: 'Počítače' },
 
     // Knihy
     { name: 'Beletrie', categoryName: 'Knihy' },
     { name: 'Naučná literatura', categoryName: 'Knihy' },
     { name: 'Dětské knihy', categoryName: 'Knihy' },
     { name: 'Učebnice', categoryName: 'Knihy' },
     { name: 'Sci-fi a fantasy', categoryName: 'Knihy' },
     { name: 'Detektivky', categoryName: 'Knihy' },
     { name: 'Historické knihy', categoryName: 'Knihy' },
     { name: 'Kuchařky', categoryName: 'Knihy' },
     { name: 'Cestopisy', categoryName: 'Knihy' },
     { name: 'Komiksy', categoryName: 'Knihy' },
     { name: 'E-knihy', categoryName: 'Knihy' },
     { name: 'Biografie', categoryName: 'Knihy' },
     { name: 'Poezie', categoryName: 'Knihy' },
     { name: 'Ostatní knihy', categoryName: 'Knihy' },
 
     // Hračky
     { name: 'Stavebnice', categoryName: 'Hračky' },
     { name: 'Panenky', categoryName: 'Hračky' },
     { name: 'Autíčka', categoryName: 'Hračky' },
     { name: 'Deskové hry', categoryName: 'Hračky' },
     { name: 'Plyšáci', categoryName: 'Hračky' },
     { name: 'Elektronické hračky', categoryName: 'Hračky' },
     { name: 'Vláčky', categoryName: 'Hračky' },
     { name: 'Hlavolamy', categoryName: 'Hračky' },
     { name: 'Hračky pro batolata', categoryName: 'Hračky' },
     { name: 'Loutky', categoryName: 'Hračky' },
     { name: 'Ostatní hračky', categoryName: 'Hračky' },
 
     // Zvířata
     { name: 'Psi', categoryName: 'Zvířata' },
     { name: 'Kočky', categoryName: 'Zvířata' },
     { name: 'Ryby', categoryName: 'Zvířata' },
     { name: 'Plazi', categoryName: 'Zvířata' },
     { name: 'Ptáci', categoryName: 'Zvířata' },
     { name: 'Hlodavci', categoryName: 'Zvířata' },
     { name: 'Koně', categoryName: 'Zvířata' },
     { name: 'Farmařská zvířata', categoryName: 'Zvířata' },
     { name: 'Akvária', categoryName: 'Zvířata' },
     { name: 'Terária', categoryName: 'Zvířata' },
     { name: 'Krmiva', categoryName: 'Zvířata' },
     { name: 'Veterinární péče', categoryName: 'Zvířata' },
     { name: 'Doplňky pro zvířata', categoryName: 'Zvířata' },
     { name: 'Ostatní zvířata', categoryName: 'Zvířata' },
 
     // Vzdělání
     { name: 'Jazykové kurzy', categoryName: 'Vzdělání' },
     { name: 'IT kurzy', categoryName: 'Vzdělání' },
     { name: 'Online kurzy', categoryName: 'Vzdělání' },
     { name: 'Hudební kurzy', categoryName: 'Vzdělání' },
     { name: 'Doučování', categoryName: 'Vzdělání' },
     { name: 'Sportovní kurzy', categoryName: 'Vzdělání' },
     { name: 'Fotografické kurzy', categoryName: 'Vzdělání' },
     { name: 'Skripta', categoryName: 'Vzdělání' },
     { name: 'Ostatn vzdělání', categoryName: 'Vzdělání' },



    // Auta
    { name: 'Škoda', categoryName: 'Auta' },
    { name: 'BMW', categoryName: 'Auta' },
    { name: 'Peugeot', categoryName: 'Auta' },
    { name: 'Kia', categoryName: 'Auta' },
    { name: 'Suzuki', categoryName: 'Auta' },
    { name: 'Audi', categoryName: 'Auta' },
    { name: 'Porsche', categoryName: 'Auta' },
    { name: 'Tesla', categoryName: 'Auta' },
    { name: 'Ford', categoryName: 'Auta' },
    { name: 'Chevrolet', categoryName: 'Auta' },
    { name: 'Mercedes', categoryName: 'Auta' },
    { name: 'Toyota', categoryName: 'Auta' },
    { name: 'Honda', categoryName: 'Auta' },
    { name: 'Volkswagen', categoryName: 'Auta' },
    { name: 'Ostatní auta', categoryName: 'Auta' },

    // Nemovitosti
    { name: '1+kk', categoryName: 'Nemovitosti' },
    { name: '2+kk', categoryName: 'Nemovitosti' },
    { name: '3+kk', categoryName: 'Nemovitosti' },
    { name: '4+kk', categoryName: 'Nemovitosti' },
    { name: 'Nábytek', categoryName: 'Nemovitosti' },
    { name: 'Domy', categoryName: 'Nemovitosti' },
    { name: 'Pozemky', categoryName: 'Nemovitosti' },
    { name: 'Chaty a chalupy', categoryName: 'Nemovitosti' },
    { name: 'Garáže', categoryName: 'Nemovitosti' },
    { name: 'Komerční objekty', categoryName: 'Nemovitosti' },
    { name: 'Pronájmy', categoryName: 'Nemovitosti' },
    { name: 'Novostavby', categoryName: 'Nemovitosti' },
    { name: 'Staré domy', categoryName: 'Nemovitosti' },
    { name: 'Kanceláře', categoryName: 'Nemovitosti' },
    { name: 'Obchodní prostory', categoryName: 'Nemovitosti' },  
    { name: 'Sklady', categoryName: 'Nemovitosti' },
    { name: 'Ostatní nemovitosti', categoryName: 'Nemovitosti' },

    // Kola
{ name: 'Městská kola', categoryName: 'Kola' },
{ name: 'Horská kola', categoryName: 'Kola' },
{ name: 'Silniční kola', categoryName: 'Kola' },
{ name: 'Kola pro děti', categoryName: 'Kola' },
{ name: 'Elektrokola', categoryName: 'Kola' },
{ name: 'BMX a freestyle kola', categoryName: 'Kola' },
{ name: 'Cyklistická výbava', categoryName: 'Kola' },
{ name: 'Náhradní díly pro kola', categoryName: 'Kola' },
{ name: 'Ostatní kola', categoryName: 'Kola' },
    // Práce
    { name: 'Administrativa', categoryName: 'Práce' },
    { name: 'IT a telekomunikace', categoryName: 'Práce' },
    { name: 'Obchod a prodej', categoryName: 'Práce' },
    { name: 'Stavebnictví', categoryName: 'Práce' },
    { name: 'Doprava a logistika', categoryName: 'Práce' },
    { name: 'Zdravotnictví', categoryName: 'Práce' },
    { name: 'Výroba', categoryName: 'Práce' },
    { name: 'Gastronomie', categoryName: 'Práce' },
    { name: 'Práce z domova', categoryName: 'Práce' },
    { name: 'Marketing', categoryName: 'Práce' },
    { name: 'Personalistika', categoryName: 'Práce' },
    { name: 'Finance', categoryName: 'Práce' },
    { name: 'Školství', categoryName: 'Práce' },
    { name: 'Brigády', categoryName: 'Práce' },
    { name: 'Ostatní práce', categoryName: 'Práce' },

    // Mobily
    { name: 'Apple', categoryName: 'Mobily' },
    { name: 'Samsung', categoryName: 'Mobily' },
    { name: 'Xiaomi', categoryName: 'Mobily' },
    { name: 'Huawei', categoryName: 'Mobily' },
    { name: 'OnePlus', categoryName: 'Mobily' },
    { name: 'Nokia', categoryName: 'Mobily' },
    { name: 'Realme', categoryName: 'Mobily' },
    { name: 'Motorola', categoryName: 'Mobily' },
    { name: 'Sony', categoryName: 'Mobily' },
    { name: 'Pixel', categoryName: 'Mobily' },
    { name: 'Asus', categoryName: 'Mobily' },
    { name: 'BlackBerry', categoryName: 'Mobily' },
    { name: 'Lenovo', categoryName: 'Mobily' },
    { name: 'Ostatní mobily', categoryName: 'Mobily' },

    // Elektronika
    { name: 'Televize', categoryName: 'Elektronika' },
    { name: 'Herní konzole', categoryName: 'Elektronika' },
    { name: 'Reproduktory', categoryName: 'Elektronika' },
    { name: 'Sluchátka', categoryName: 'Elektronika' },
    { name: 'Fotoaparáty', categoryName: 'Elektronika' },
    { name: 'Kamery', categoryName: 'Elektronika' },
    { name: 'Chytré hodinky', categoryName: 'Elektronika' },
    { name: 'Drony', categoryName: 'Elektronika' },
    { name: 'Herní příslušenství', categoryName: 'Elektronika' },
    { name: 'Projektory', categoryName: 'Elektronika' },
    { name: 'Domácí kina', categoryName: 'Elektronika' },
    { name: 'Smart domácnost', categoryName: 'Elektronika' },
    { name: 'Ostatní elektronika', categoryName: 'Elektronika' },

    // Zahrada
    { name: 'Rostliny', categoryName: 'Zahrada' },
    { name: 'Zahradní nářadí', categoryName: 'Zahrada' },
    { name: 'Grily', categoryName: 'Zahrada' },
    { name: 'Bazény', categoryName: 'Zahrada' },
    { name: 'Skleníky', categoryName: 'Zahrada' },
    { name: 'Kompostéry', categoryName: 'Zahrada' },
    { name: 'Travní sekačky', categoryName: 'Zahrada' },
    { name: 'Postřikovače', categoryName: 'Zahrada' },
    { name: 'Zahradní dekorace', categoryName: 'Zahrada' },
    { name: 'Houpačky', categoryName: 'Zahrada' },
    { name: 'Altány', categoryName: 'Zahrada' },
    { name: 'Zahradní osvětlení', categoryName: 'Zahrada' },
    { name: 'Dřevěné pergoly', categoryName: 'Zahrada' },
    { name: 'Vodní fontány', categoryName: 'Zahrada' },
    { name: 'Ostatní zahrada', categoryName: 'Zahrada' },

  // Oblečení
  { name: 'Dámské oblečení', categoryName: 'Oblečení' },
  { name: 'Pánské oblečení', categoryName: 'Oblečení' },
  { name: 'Dětské oblečení', categoryName: 'Oblečení' },
  { name: 'Sportovní oblečení', categoryName: 'Oblečení' },
  { name: 'Spodní prádlo', categoryName: 'Oblečení' },
  { name: 'Boty', categoryName: 'Oblečení' },
  { name: 'Kabelky a tašky', categoryName: 'Oblečení' },
  { name: 'čepice, šály, rukavice', categoryName: 'Oblečení' },
  { name: 'Šperky a hodinky', categoryName: 'Oblečení' },
  { name: 'Brýle', categoryName: 'Oblečení' },
  { name: 'Hodinky', categoryName: 'Oblečení' },
  { name: 'Plavky', categoryName: 'Oblečení' },
  { name: 'Luxusní móda', categoryName: 'Oblečení' },
  { name: 'Pracovní oblečení', categoryName: 'Oblečení' },
  { name: 'Ostatní oblečení', categoryName: 'Oblečení' },
    
    { name: 'Koncerty', categoryName: 'Vstupenky' },
    { name: 'Festivaly', categoryName: 'Vstupenky' },
    { name: 'Divadlo', categoryName: 'Vstupenky' },
    { name: 'Muzikály', categoryName: 'Vstupenky' },
    { name: 'Sportovní akce', categoryName: 'Vstupenky' },
    { name: 'Fotbal', categoryName: 'Vstupenky' },
    { name: 'Hokej', categoryName: 'Vstupenky' },
    { name: 'Basketbal', categoryName: 'Vstupenky' },
    { name: 'Tenis', categoryName: 'Vstupenky' },
    { name: 'MotoGP & F1', categoryName: 'Vstupenky' },
    { name: 'Výstavy', categoryName: 'Vstupenky' },
    { name: 'Kina', categoryName: 'Vstupenky' },
    { name: 'Ostatní vstupenky', categoryName: 'Vstupenky' },

    // Ostatní
    { name: 'Sběratelské předměty', categoryName: 'Ostatní' },
    { name: 'Hudební nástroje', categoryName: 'Ostatní' },
    { name: 'Starožitnosti', categoryName: 'Ostatní' },
    { name: 'Vinylové desky', categoryName: 'Ostatní' },
    { name: 'Ostatní', categoryName: 'Ostatní' },
];
  
  // Získání všech kategorií z DB
  const allCategories = await prisma.categories.findMany();
  
  // Vytvoření sekcí
  for (const section of sections) {
    const category = allCategories.find(cat => cat.name === section.categoryName);
    
    if (category) {
      // Check if the section already exists
      const existingSection = await prisma.sections.findUnique({
        where: { name: section.name }
      });
  
      if (!existingSection) {
        // Create the section if it doesn't exist
        await prisma.sections.create({
          data: {
            name: section.name,
            categoryId: category.id,
          },
        });
      } else {
        console.log(`Section '${section.name}' already exists.`);
      }
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