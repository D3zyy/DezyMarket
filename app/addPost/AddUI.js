"use client";
import React, { useEffect, useState } from 'react';


const AddUI = ({ accType, userCategories }) => {
  const [typeOfPost, setTypeOfPost] = useState(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [activeButton, setActiveButton] = useState(null); // name of the current price it could be like not numeric 
  const [price, setPrice] = useState('');
  const [images, setImages] = useState([]);

  // Handle file input
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
  
    // Determine the maximum number of uploads based on typeOfPost
    const maxUploads = 
      typeOfPost === process.env.NEXT_PUBLIC_BASE_RANK
        ? 2
        : typeOfPost === process.env.NEXT_PUBLIC_MEDIUM_RANK
        ? 5
        : typeOfPost === process.env.NEXT_PUBLIC_BEST_RANK
        ? 10
        : 2; 
  
        if (selectedFiles.length + images.length > maxUploads) {
            alert(`Maximální počet obrázků je: ${maxUploads}`);
            return;
          }
  
    const validImages = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );
    const newImages = validImages.map((file) => URL.createObjectURL(file));
    setImages((prevImages) => [...prevImages, ...newImages]);
  };

  // Handle image deletion
  const handleDeleteImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };
  const handleButtonClick = (buttonName) => {
    if (activeButton === buttonName) {
      setIsDisabled(false);
      setActiveButton(null);
    } else {
      setIsDisabled(true);
      setActiveButton(buttonName);
      setPrice('');
    }
  };

  function getRandomCategories(categories, count) {
    const shuffled = [...categories].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  const randomCategories = userCategories.length
    ? getRandomCategories(userCategories, 3)
    : [
        { category: { name: 'Sluchátka', logo: '🎧' } },
        { category: { name: 'Dům', logo: '🏠' } }
      ];

  const prefix = "např. ";
  const beforeText = randomCategories
    .map(category => {
      const decodedLogo = category.category.logo.includes('&#')
        ? String.fromCodePoint(category.category.logo.match(/\d+/)[0])
        : category.category.logo;
      return `${category.category.name} ${decodedLogo}`;
    })
    .join(', ');

  const placeText = `${prefix}${beforeText}`;

  const handleVisibilityChange = () => {
    const divElement = document.querySelector('.addPostSecondStep');
    const isVisible = divElement && getComputedStyle(divElement).display === 'block';

    if (isVisible) {
      const storedTypeOfPost = localStorage.getItem('typeOfPost');
      if (
        (storedTypeOfPost === process.env.NEXT_PUBLIC_MEDIUM_RANK && storedTypeOfPost === accType) ||
        (storedTypeOfPost === process.env.NEXT_PUBLIC_BASE_RANK && storedTypeOfPost === accType) ||
        (storedTypeOfPost === process.env.NEXT_PUBLIC_BEST_RANK && storedTypeOfPost === accType)
      ) {
        setTypeOfPost(storedTypeOfPost);
      } else {
        setTypeOfPost(process.env.NEXT_PUBLIC_BASE_RANK);
      }
    }
  };

  useEffect(() => {
    const observer = new MutationObserver(handleVisibilityChange);
    const targetNode = document.querySelector('.addPostSecondStep');

    if (targetNode) {
      observer.observe(targetNode, { attributes: true, attributeFilter: ['style'] });
    }

    return () => {
      if (targetNode) observer.disconnect();
    };
  }, []);

  return (
    <>
      {typeOfPost && (
        <div
          style={{
            marginBottom: "40px",
            padding: "16px",
            width: "100%",
            maxWidth: "500px",
            margin: "0 auto",
          }}
          className="typeOfPosts flex flex-col items-center justify-center gap-2 p-4"
        >
          
          <form action="">
            <div className="py-2 w-full">
              <label htmlFor="name" className="block" style={{ fontSize: '14px' }}>Co nabízím</label>
              <input
                minLength={5} // Minimální délka 5 znaků
                maxLength={120}
                pattern="[A-Za-z0-9\s#%&'()*+,-./:;=?[\]^_`{|}~]*"
                type="text"
                placeholder={placeText}
                name="name"
                className="input input-bordered w-full"
                required
                style={{ fontSize: '14px', padding: '8px' }}
              />
            </div>
            <div className="py-2 w-full">
              <label htmlFor="name" className="block" style={{ fontSize: '14px' }}>Popisek</label>
              <textarea 

  placeholder='Prodám.. Nabízím.. Daruji..'
  name="name"
  className="input input-bordered w-full"
  required
  minLength={15} // Minimální délka 5 znaků
  maxLength={1500} // Maximální délka 500 znaků
  style={{ 
    fontSize: '14px', 
    padding: '8px', 
    height: '150px', // Počáteční výška
    resize: 'none' // Zamezení změny velikosti
  }}
/>
            </div>
            <div className="w-full">
              <div
                className="flex items-center "
                style={{
                  padding: "12px",
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <label htmlFor="price" className="block" style={{ flex: "0 0 auto", fontSize: '14px' }}>Cena</label>
                <input
                  min={1}
                  max={50000000}
                  inputMode="numeric"
                  type="number"
                  name="price"
                  className="input input-bordered"
                  required
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={isDisabled}
                  style={{
                    width: '35%',
                    minWidth: '5px',
                    fontSize: '12px',
                    padding: '6px',
                  }}
                />

                <span className="mx-2" style={{ fontSize: '20px' }}>|</span>

                <div className="flex gap-2" style={{ flex: "0 1 auto", justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => handleButtonClick('Dohodou')}
                    className="btn btn-active"
                    style={{
                      transition: 'background-color 0.3s, box-shadow 0.3s',
                      width: '60px',
                      fontSize: '12px',
                      padding: '6px 8px',
                      boxShadow: activeButton === 'Dohodou' ? '0px 0px 10px var(--fallback-p,oklch(var(--p)/var(--tw-bg-opacity)))' : 'none',
                    }}
                  >
                    Dohodou
                  </button>
                  <button
                    type="button"
                    onClick={() => handleButtonClick('V textu')}
                    className="btn btn-active"
                    style={{
                      transition: 'background-color 0.3s, box-shadow 0.3s',
                      width: '60px',
                      fontSize: '12px',
                      padding: '6px 8px',
                      boxShadow: activeButton === 'V textu' ? '0px 0px 10px var(--fallback-p,oklch(var(--p)/var(--tw-bg-opacity)))' : 'none',
                    }}
                  >
                    V textu
                  </button>
                  <button
                    type="button"
                    onClick={() => handleButtonClick('Zdarma')}
                    className="btn btn-active"
                    style={{
                      transition: 'background-color 0.3s, box-shadow 0.3s',
                      width: '60px',
                      fontSize: '12px',
                      padding: '6px 8px',
                      boxShadow: activeButton === 'Zdarma' ? '0px 0px 10px var(--fallback-p,oklch(var(--p)/var(--tw-bg-opacity)))' : 'none',
                    }}
                  >
                    Zdarma
                  </button>
                </div>

              </div>



              <div className="w-full flex flex-col items-center">
      {/* File count display */}
      

      {/* Image input */}
      <label >
      <input
      style={{ display: "none" }}
      type="file"
      aria-label="yo"
      title="Title"
      accept="image/*"
      multiple
      onChange={handleImageChange}
      className="mb-4"
      disabled={
        images.length >= (
          typeOfPost === process.env.NEXT_PUBLIC_BASE_RANK
            ? 2
            : typeOfPost === process.env.NEXT_PUBLIC_MEDIUM_RANK
            ? 5
            : typeOfPost === process.env.NEXT_PUBLIC_BEST_RANK
            ? 10
            : 2
        )
      }
    />
    <div className="flex flex-col items-center justify-center mb-2 relative border-2 border-dotted border-gray-500 rounded-lg p-4">
      {/* Blur effect when input is disabled */}
      {images.length >= (
        typeOfPost === process.env.NEXT_PUBLIC_BASE_RANK
          ? 2
          : typeOfPost === process.env.NEXT_PUBLIC_MEDIUM_RANK
          ? 5
          : typeOfPost === process.env.NEXT_PUBLIC_BEST_RANK
          ? 10
          : 2
      ) && (
        <div className="absolute inset-0 backdrop-blur-sm rounded-lg" />
      )}
      
      {/* Display the count above the blur when the limit is reached */}
      {images.length >= (
        typeOfPost === process.env.NEXT_PUBLIC_BASE_RANK
          ? 2
          : typeOfPost === process.env.NEXT_PUBLIC_MEDIUM_RANK
          ? 5
          : typeOfPost === process.env.NEXT_PUBLIC_BEST_RANK
          ? 10
          : 2
      ) ? (
        <div className="flex items-center justify-center mb-1 relative z-10">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6 mr-2"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
        </svg>
        <span className="text-gray-500 text-center">
          Obrázky  {images.length}/{typeOfPost === process.env.NEXT_PUBLIC_BASE_RANK ? 2 : typeOfPost === process.env.NEXT_PUBLIC_MEDIUM_RANK ? 5 : 10}
        </span>
    </div>
      ) : (
        // "Nahrát obrázky" text when the limit is not reached
        <div className="flex items-center justify-center mb-1 relative z-10">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6 mr-2"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
        </svg>
        <span className="text-center text-gray-500 relative z-10">Nahrát obrázky</span>
        </div>
      )}
    </div>
    </label>
      {/* Image preview */}
      <div className="flex flex-wrap gap-4 justify-center items-center">
        {images.length > 0 &&
          images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image}
                alt={`Preview ${index + 1}`}
                className="h-32 w-32 object-cover rounded shadow-md"
              />
              <button
                onClick={() => handleDeleteImage(index)}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-700"
                style={{ transform: "translate(50%, -50%)" }} // Ensure button stays aligned
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
          ))}
      </div>
    </div>
                

   

              
              
              
              <div className="w-full flex">
                <input
                    style={{ marginTop: "10px" }}
                    className="btn btn-block btn-primary"
                    type="submit"
                    value="Vytvořit"
                />
            </div>
            </div>
          </form>
        </div>
      )}
      <style jsx>{`
        /* Chrome, Safari, Edge, Opera */
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        /* Firefox */
        input[type='number'] {
          -moz-appearance: textfield;
        }
      `}</style>
    </>
  );
};

export default AddUI;