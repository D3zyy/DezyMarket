import React from "react";
import SearchComponent from "@/app/components/SearchComponent";
import localFont from "next/font/local";
import { prisma } from "../database/db";
import { headers } from "next/headers"; // Získání URL requestu

// Správné cesty k fontům (musí být v /public/fonts/)
const pacifico = localFont({
  src: "/../../public/fonts/Pacifico/Pacifico-Regular.ttf",
  weight: "400",
  style: "normal",
});

const bebas = localFont({
  src: "/../../public/fonts/Bebas_Neue/BebasNeue-Regular.ttf",
  weight: "400",
  style: "normal",
});

async function Layout({ children }) {
  // 🟢 Získání URL requestu a extrakce searchParams
  const headersList = headers();
  const fullUrl = headersList.get("referer") || ""; // Celá URL
  const searchParams = new URL(fullUrl, "http://localhost").searchParams;

  // 🟢 Získání parametrů (fallback na prázdný string)
  const category = searchParams.get("category") || "";
  const section = searchParams.get("section") || "";
  const price = searchParams.get("price") || "";
  const location = searchParams.get("location") || "";
  console.log("category:",category)
  console.log("section:",section)
  console.log("price:",price)
  // 🟢 Získání kategorií z databáze
  const categories = await prisma.categories.findMany({
    include: { sections: true },
  });

  return (
    <div>
      <div className="fixed top-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center w-full z-10 p-4">
        <h1 className={`${bebas.className} text-4xl font-bold`}>Dezy</h1>
        <span className={`${pacifico.className} text-lg font-semibold mt-1`}>
          „Lepší místo pro vaše inzeráty.“
        </span>

        <div className="flex flex-col gap-2 md:flex-row justify-center font-bold md:static p-2 rounded-lg max-w-[300px] md:max-w-[600px] mx-auto mt-2 mb-1">
          <SearchComponent />
        </div>

        {/* Kategorie, Místo a Cena */}
        <div className="flex flex-col gap-2 md:flex-row justify-center font-bold md:static p-2 rounded-lg max-w-[300px] md:max-w-[600px] mx-auto mt-2 mb-1">
          {/* Kategorie */}
          <select className="md:max-w-[130px] select select-bordered" defaultValue={category}>
            <option value="">Kategorie</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Místo */}
          <select className="md:max-w-[150px] select select-bordered" defaultValue={location}>
            <option value="">Místo</option>
            {[
      { id: "praha", name: "Praha" },
      { id: "brno", name: "Brno" },
      { id: "ostrava", name: "Ostrava" },
      { id: "olomouc", name: "Olomouc" },
      { id: "plzen", name: "Plzeň" },
      { id: "stredocesky_kraj", name: "Středočeský kraj" },
      { id: "jihocesky_kraj", name: "Jihočeský kraj" },
      { id: "plzensky_kraj", name: "Plzeňský kraj" },
      { id: "karlovarsky_kraj", name: "Karlovarský kraj" },
      { id: "ustecky_kraj", name: "Ústecký kraj" },
      { id: "liberecky_kraj", name: "Liberecký kraj" },
      { id: "kralovehradecky_kraj", name: "Královéhradecký kraj" },
      { id: "pardubicky_kraj", name: "Pardubický kraj" },
      { id: "jihomoravsky_kraj", name: "Jihomoravský kraj" },
      { id: "zlinsky_kraj", name: "Zlínský kraj" },
      { id: "olomoucky_kraj", name: "Olomoucký kraj" },
      { id: "moravskoslezsky_kraj", name: "Moravskoslezský kraj" },
      { id: "kraj_vysocina", name: "Kraj Vysočina" },
    ].map((location) => (
      <option  key={location.id} value={location.name}>
        {location.name}
      </option>
    ))}
          </select>

          {/* Cena */}
          <select className="md:max-w-[120px] select select-bordered" defaultValue={price}>
            <option value="">Cena</option>
            <option value="Dohodou">Dohodou</option>
            <option value="V textu">V textu</option>
            <option value="Zdarma">Zdarma</option>
            <option value="1-500 Kč">1-500 Kč</option>
            <option value="500-5 000 Kč">500-5 000 Kč</option>
            <option value="5 000-50 000 Kč">5 000-50 000 Kč</option>
            <option value="50 000+">50 000+</option>
          </select>
        </div>
      </div>

      {/* Obsah stránky */}
      <div className="mt-32">{children}</div>
    </div>
  );
}

export default Layout;