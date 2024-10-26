"use client";
import { useState } from 'react';

const ImageGallery = ({ allImages }) => {
  // Předpokládám, že allImages je pole objektů s url, nikoliv pole stringů
  const [mainImage, setMainImage] = useState(allImages[0].url);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const additionalCount = allImages.length - 4; // Počet dalších obrázků

  return (
    <div className="lg:w-1/2"> {/* Center the main container */}
      {/* Set the first image as the main image */}
      <div className="bg-gray-100 h-5/6 flex items-center justify-center rounded-lg overflow-hidden">
        <img
          src={mainImage} // Použij aktuální hlavní obrázek
          alt="Main"
          className="w-full h-full"
        />
      </div>

      {/* Malé obrázky */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {allImages.slice(1, 3).map((thumbnail, index) => ( // Opraveno na 1, 4, aby se vzaly tři obrázky
          <div key={index} className="relative w-full h-20">
            <img
              src={thumbnail.url} // Použij url z objektu thumbnail
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full rounded-lg cursor-pointer"
              onMouseEnter={() => setMainImage(thumbnail.url)} // Nastav hlavní obrázek při hoveru
              onMouseLeave={() => setMainImage(allImages[0].url)} // Resetuj na první obrázek
              onClick={() => setIsGalleryOpen(true)} // Otevři galeri
            />
          </div>
        ))}

        {/* Poslední miniatura s dynamickým "+x" overlay, pokud jsou více než 4 obrázky */}
        {additionalCount > 0 && (
          <div className="relative w-full h-20">
            <div 
              className="absolute inset-0 rounded-lg bg-opacity-25 cursor-pointer"
              onClick={() => setIsGalleryOpen(true)} // Otevři galeri
            >
              <img
                src={allImages[3].url} 
                alt="Thumbnail 4"
                className="w-full h-full rounded-lg"
              />
              {additionalCount > 0 && (
                <div className="flex items-center justify-center absolute inset-0 bg-black bg-opacity-50 text-white font-bold rounded-lg">
                  +{additionalCount}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Galerie Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75"> {/* Základ */}
          <div className="bg-base-100 p-6 md:rounded-lg relative max-w-4xl w-full max-h-[100vh] overflow-auto">
            {/* Tlačítko pro zavření pomocí SVG */}
            <div className='mx-auto text-center'>
              <button
                type="button"
                onClick={() => setIsGalleryOpen(false)}
                className="bg-red-500 text-white rounded-full p-1 hover:bg-red-700 text-center mb-5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Zobraz všechny obrázky v galerii */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> {/* Zajistí, že galerie může scrollovat */}
              {allImages.map((image, index) => (
                <img 
                  key={index} 
                  src={image.url} // Použij url z objektu image
                  alt={`Gallery Image ${index + 1}`} 
                  className="w-full h-auto rounded-lg object-cover" 
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;