"use client";
import { useState } from 'react';

const ImageGallery = () => {
  const [mainImage, setMainImage] = useState('https://www.bazos.cz/img/1/688/192124688.jpg?t=1728305789');
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const allImages = [
    'https://www.bazos.cz/img/1/688/192124688.jpg?t=1728305789',
    'https://www.bazos.cz/img/1/688/192124688.jpg?t=1728305789',
    'https://loremflickr.com/200/200?random=1',
    'https://loremflickr.com/200/200?random=2',
    'https://loremflickr.com/200/200?random=3',
    // Add more images as needed
  ];

  const additionalCount = allImages.length - 4; // Number of additional images

  return (
    <div className="max-w-md mx-auto"> {/* Center the main container */}
      {/* Set the first image as the main image */}
      <div className="bg-gray-100 h-96 flex items-center justify-center rounded-lg overflow-hidden">
        <img
          src={mainImage} // Use the current main image
          alt="Main"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Small images container */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {allImages.slice(1, 3).map((thumbnail, index) => (
          <div key={index} className="relative w-full h-20">
            <img
              src={thumbnail}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full rounded-lg cursor-pointer"
              onMouseEnter={() => setMainImage(thumbnail)} // Set main image on hover
              onMouseLeave={() => setMainImage(allImages[0])} // Reset to first image when not hovering
            />
          </div>
        ))}

        {/* Last thumbnail with dynamic "+x" overlay if there are more than 4 images */}
        {additionalCount > 0 && (
          <div className="relative w-full h-20">
            <div 
              className="absolute inset-0 rounded-lg bg-opacity-25 cursor-pointer"
              onClick={() => setIsGalleryOpen(true)} // Open gallery modal
            >
              <img
                src={allImages[3]} 
                alt="Thumbnail 4"
                className="w-full h-full rounded-lg"
              />
              {additionalCount > 0 && additionalCount >= 1 ? (
                <div className="flex items-center justify-center absolute inset-0 bg-black bg-opacity-50 text-white font-bold rounded-lg">
                  +{additionalCount}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75"> {/* Backdrop */}
          <div className="bg-base-100 p-6 md:rounded-lg relative max-w-4xl w-full max-h-[100vh] overflow-auto">

            {/* Close button using SVG */}
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

            {/* Display all images in the gallery */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4"> {/* Ensure gallery can scroll */}
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