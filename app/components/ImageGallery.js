"use client";
import { useState } from 'react';

const ImageGallery = () => {
  const [mainImage, setMainImage] = useState('https://www.bazos.cz/img/1/688/192124688.jpg?t=1728305789');
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const allImages = [
    'https://www.bazos.cz/img/1/688/192124688.jpg?t=1728305789',
    'https://www.bazos.cz/img/2t/688/192124688.jpg?t=1728305789',
    'https://www.bazos.cz/img/3t/688/192124688.jpg?t=1728305789',
    'https://www.bazos.cz/img/4t/688/192124688.jpg?t=1728305789',
    // Add more images as needed
  ];

  const additionalCount = allImages.length - 3; // Assuming 3 are displayed

  return (
    <div className="max-w-md mx-auto"> {/* Center the main container */}
      {/* Main image */}
      <div className="bg-gray-100 h-96 flex items-center justify-center rounded-lg overflow-hidden">
        <img
          src={mainImage}
          alt="Main"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Small images container */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {allImages.slice(1, 3).map((thumbnail, index) => (
          <div key={index} className="w-full h-20">
            <img
              src={thumbnail}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full rounded-lg cursor-pointer"
              onMouseEnter={() => setMainImage(thumbnail)}
              onMouseLeave={() => setMainImage(allImages[0])}
            />
          </div>
        ))}

        {/* Last thumbnail with dynamic "+x" overlay */}
        <div className="relative w-full h-20">
          <div 
            className="absolute inset-0 rounded-lg bg-opacity-25 cursor-pointer"
            onClick={() => setIsGalleryOpen(true)} // Open gallery modal
          >
            <img
              src={allImages[2]} 
              alt="Thumbnail 3"
              className="w-full h-full rounded-lg"
            />
            <div className="flex items-center justify-center absolute inset-0 bg-black bg-opacity-50 text-white font-bold rounded-lg">
              +{additionalCount}
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75"> {/* Backdrop */}
          <div className="bg-base-100  p-6 rounded-lg relative max-w-4xl w-full max-h-[90vh] overflow-visible"> {/* Modal with primary background color */}
            {/* Close button using SVG */}
            <button
  type="button"
  onClick={() => setIsGalleryOpen(false)}
className="absolute top-0 left-1/2 transform -translate-x-1/2 lg:left-auto lg:right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-700"
  style={{ transform: "translate(50%, -50%)" }}
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

            {/* Display all images in the gallery */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto"> {/* Ensure gallery can scroll */}
              {allImages.map((image, index) => (
                <img 
                  key={index} 
                  src={image} 
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