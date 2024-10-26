"use client";
import { useState } from 'react';

const ImageGallery = ({ allImages }) => {

  allImages = [
    {
      id: 3,
      url: 'https://loremflickr.com/200/200?random=1',
      postId: 11
    },
    {
      id: 4,
      url: 'https://loremflickr.com/550/550?random=3',
      postId: 11
    },
    {
      id: 5,
      url: 'https://loremflickr.com/250/250?random=3',
      postId: 11
    },
    {
      id: 6,
      url: 'https://loremflickr.com/1200/1200?random=2',
      postId: 11
    },
    {
      id: 7,
      url: 'https://loremflickr.com/300/300?random=1',
      postId: 11
    },
    {
      id: 8,
      url: 'https://loremflickr.com/400/400?random=2',
      postId: 11
    }
  ];


  const [mainImage, setMainImage] = useState(allImages[0]?.url || "");
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  
  const additionalCount = allImages.length - 4;

  return (
    <div className="lg:w-1/2"> {/* Center the main container */}
      {/* Conditional SVG display when there are no images */}
      {allImages.length === 0 ? (
        <>
  <div className="relative flex items-center justify-center h-full"> {/* Center both horizontally and vertically */}
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={1.5} 
      stroke="currentColor" 
      className="size-96"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" 
      />
    </svg>

  </div>
</>
        
      ) : (
        <>
          {/* Display the main image */}
          <div className="bg-gray-100 h-5/6 flex items-center justify-center rounded-lg overflow-hidden">
            <img
              src={mainImage}
              alt="Main"
              className="w-full h-full"
            />
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {allImages.slice(1, 3).map((thumbnail, index) => ( // Updated to take three images
              <div key={index} className="relative w-full h-20">
                <img
                  src={thumbnail.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full rounded-lg cursor-pointer"
                  onMouseEnter={() => setMainImage(thumbnail.url)} // Set main image on hover
                  onMouseLeave={() => setMainImage(allImages[0].url)} // Reset to first image
                  onClick={() => setIsGalleryOpen(true)} // Open gallery
                />
              </div>
            ))}

            {/* Last thumbnail with dynamic overlay if more than 4 images */}
            {additionalCount > 0 && (
              <div className="relative w-full h-20">
                <div
                  className="absolute inset-0 rounded-lg bg-opacity-25 cursor-pointer"
                  onClick={() => setIsGalleryOpen(true)} // Open gallery
                >
                  <img
                    src={allImages[3].url}
                    alt="Thumbnail 4"
                    className="w-full h-full rounded-lg"
                  />
                  <div className="flex items-center justify-center absolute inset-0 bg-black bg-opacity-50 text-white font-bold rounded-lg">
                    +{additionalCount}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Gallery Modal */}
          {isGalleryOpen && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75">
              <div className="bg-base-100 p-6 md:rounded-lg relative max-w-4xl w-full max-h-[100vh] overflow-auto">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {allImages.map((image, index) => (
                    <img 
                      key={index} 
                      src={image.url}
                      alt={`Gallery Image ${index + 1}`} 
                      className="w-full h-auto rounded-lg object-cover" 
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ImageGallery;