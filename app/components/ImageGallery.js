"use client";
import { useState } from 'react';

const ImageGallery = ({ allImages, typeOfPost }) => {
  allImages = [
    {
      id: 3,
      url: 'https://www.bazos.cz/img/1/002/193135002.jpg?t=1730188023',
      postId: 11
    },
    {
      id: 4,
      url: 'https://www.bazos.cz/img/2/708/192821708.jpg?t=1730578147',
      postId: 11
    },
    {
      id: 5,
      url: 'https://www.bazos.cz/img/3/708/192821708.jpg?t=1730578147',
      postId: 11
    },
    {
      id: 6,
      url: 'https://www.bazos.cz/img/4/708/192821708.jpg?t=1730578147',
      postId: 11
    },
    {
      id: 7,
      url: 'https://www.bazos.cz/img/6/708/192821708.jpg?t=1730578147',
      postId: 11
    },
    
  ];

  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const additionalCount = allImages.length - 4;

  const handleNextImage = () => {
    setMainImageIndex((prevIndex) => (prevIndex + 1) % allImages.length);
  };

  const handlePreviousImage = () => {
    setMainImageIndex((prevIndex) => 
      (prevIndex - 1 + allImages.length) % allImages.length
    );
  };

  return (
    <div
    className={`lg:w-1/2 `}> {/* Center the main container */}
      {allImages.length === 0 ? (
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
      ) : (
        <>
          {/* Main image display with conditional navigation arrows */}
          <div className="relative bg-gray-100 max-h-[500px] h-5/6 flex items-center justify-center rounded-lg overflow-hidden">
            {allImages.length > 1 && (
              <>
                <button
                  onClick={handlePreviousImage}
                  className="absolute left-0 p-2 m-2 bg-black bg-opacity-50 text-white rounded-full"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </>
            )}

            <img
              src={allImages[mainImageIndex].url}
              alt="Main"
              className="w-full h-full"
            />

            {allImages.length > 1 && (
              <>
                <button
                  onClick={handleNextImage}
                  className="absolute right-0 p-2 m-2 bg-black bg-opacity-50 text-white rounded-full"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {allImages.slice(1, 3).map((thumbnail, index) => (
             <div key={index} className="relative w-full h-20">
             <img
               src={thumbnail.url}
               alt={`Thumbnail ${index + 1}`}
               className="w-full h-full rounded-lg cursor-pointer"
               onMouseEnter={() => {
                 if (window.innerWidth >= 968) setMainImageIndex(index + 1);
               }}
               onMouseLeave={() => {
                 if (window.innerWidth >= 968) setMainImageIndex(0);
               }}
               onClick={() => setIsGalleryOpen(true)}
             />
           </div>
            ))}

            {additionalCount >= 0 && (
              <div className="relative w-full h-20">
                <div 
                  className="absolute inset-0 rounded-lg bg-opacity-25 cursor-pointer"
                  onClick={() => setIsGalleryOpen(true)}
                >
                  <img
                    src={allImages[3].url} 
                    alt="Thumbnail 4"
                    className="w-full h-full rounded-lg"
                  />
                  {additionalCount > 0 ? (
                    <div className="flex items-center justify-center absolute inset-0 bg-black bg-opacity-50 text-white font-bold rounded-lg">
                      +{additionalCount}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center absolute inset-0 bg-black bg-opacity-50 text-white font-bold rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
                      </svg>
                    </div>
                  )}
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