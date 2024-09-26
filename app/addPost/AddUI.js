"use client";
import React, { useEffect, useState } from 'react';

const AddUI = ({ accType, userCategories }) => {
  const [typeOfPost, setTypeOfPost] = useState(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [activeButton, setActiveButton] = useState(null); // name of the current price it could be like not numeric 
  const [price, setPrice] = useState('');

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
            maxWidth: "600px",
            margin: "0 auto",
          }}
          className="typeOfPosts flex flex-col items-center justify-center gap-2 p-4"
        >
          <h3 style={{ padding: "20px", textAlign: 'center', fontSize: '16px' }} className="font-bold">
            {typeOfPost}
          </h3>
          <form action="">
            <div className="py-2 w-full">
              <label htmlFor="name" className="block" style={{ fontSize: '14px' }}>Co nabízím</label>
              <input
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

  placeholder='Nabízím..'
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