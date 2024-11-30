"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ImageGallery = ({ allImages }) => {
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  allImages = [
    
    {
      id: 31,
      url: 'https://www.bazos.cz/img/1/496/194675496.jpg?t=1732886458',
      postId: 11
    },
    {
      id: 3,
      url: 'https://www.bazos.cz/img/2/496/194675496.jpg?t=1732886458',
      postId: 11
    },
    {
      id: 4,
      url: 'https://www.bazos.cz/img/3/496/194675496.jpg?t=1732886458',
      postId: 11
    },
    {
      id: 5,
      url: 'https://www.bazos.cz/img/4/496/194675496.jpg?t=1732886458',
      postId: 11
    },
    {
      id: 5,
      url: 'https://www.bazos.cz/img/6/496/194675496.jpg?t=1732886458',
      postId: 11
    },
    {
      id: 5,
      url: 'https://www.bazos.cz/img/5/496/194675496.jpg?t=1732886458',
      postId: 11
    },
    {
      id: 5,
      url: 'https://www.bazos.cz/img/7/496/194675496.jpg?t=1732886458',
      postId: 11
    },
    {
      id: 5,
      url: 'https://www.bazos.cz/img/8/496/194675496.jpg?t=1732886458',
      postId: 11
    },
    {
      id: 5,
      url: 'https://www.bazos.cz/img/9/496/194675496.jpg?t=1732886458',
      postId: 11
    },
    {
      id: 5,
      url: 'https://www.bazos.cz/img/10/496/194675496.jpg?t=1732886458',
      postId: 11
    },
    
    
  ];

  // Disable/enable scrolling on the main page when the gallery is opened/closed
  useEffect(() => {
    if (isGalleryOpen) {
      document.body.style.overflow = "hidden"; // Disable scrolling
      document.body.style.position = "fixed"
    } else {
      document.body.style.overflow = ""; // Enable scrolling
          document.body.style.position = ""
    }

    // Cleanup to reset scrolling if the component is unmounted
    return () => {
      document.body.style.overflow = "";
        document.body.style.position = ""
    };
  }, [isGalleryOpen]);

  const handleNextImage = () => {
    setMainImageIndex((prevIndex) => (prevIndex + 1) % allImages.length);
  };

  const handlePreviousImage = () => {
    setMainImageIndex((prevIndex) => 
      (prevIndex - 1 + allImages.length) % allImages.length
    );
  };

  const additionalCount = allImages.length - 4;

  return (
    <div className="lg:w-1/2 ">
      {allImages.length === 0 ? (
        <div className="relative flex items-center justify-center h-full">
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
          {/* Main Image Display */}
          <div className="relative bg-gray-100 max-h-[600px] flex items-center justify-center rounded-lg overflow-auto">
           

             <AnimatePresence mode="wait">
              <motion.img
                key={mainImageIndex}
                src={allImages[mainImageIndex].url}
                alt="Main"
                className="w-full h-full "
                initial={{ opacity: 0.8, filter: "blur(40px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0.9, filter: "blur(40px)" }}
                transition={{ duration: 0.38 }}
              />
            </AnimatePresence>
            {allImages.length > 1 && (
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
            )}

            {allImages.length > 1 && (
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
            )}
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {allImages.slice(1, 3).map((thumbnail, index) => (
              <div key={index} className="relative w-full h-20">
                <img
                  loading="lazy"
                  decoding="async"
                  src={thumbnail.url}
                  alt={`Obrázek ${index + 1}`}
                  className="w-full h-full rounded-lg cursor-pointer"
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
                    loading="lazy"
                    decoding="async"
                    src={allImages[3].url} 
                    alt="Obrázek 4"
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

          {/* Gallery Modal */}
          {isGalleryOpen && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75">
              <div className="bg-base-100 p-6 md:rounded-lg relative  w-full max-h-[105vh] overflow-y-scroll">
                <div className="mx-auto text-center">
                  <button
                    type="button"
                    onClick={() => setIsGalleryOpen(false)}
                    className="bg-red-500 text-white rounded-full p-1 hover:bg-red-700 text-center mb-5 sm:mt-3 mt-16"
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
                      loading="lazy"
                      decoding="async"
                      key={index}
                      src={image.url}
                      alt={`Obrázek ${index + 1}`}
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