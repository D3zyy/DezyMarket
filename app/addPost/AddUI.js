"use client";
import React, { useEffect, useState } from 'react';

const AddUI = ({accType,userCategories}) => {
  const [typeOfPost, setTypeOfPost] = useState(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [activeButton, setActiveButton] = useState(null); // Track which button is active
  const [price, setPrice] = useState('');


    const handleButtonClick = (buttonName) => {
        if (activeButton === buttonName) {
            // If the same button is clicked, deactivate it
            setIsDisabled(false);
            setActiveButton(null);
        } else {
            // Activate the new button, disable the input, and clear the input value
            setIsDisabled(true);
            setActiveButton(buttonName);
            setPrice(''); // Clear the input value
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
      { category: { name: 'Dům', logo: '&#127968;;' } }
    ]; // Výchozí hodnota, pokud je pole prázdné

    // Spojení názvů a log do jednoho stringu
    const prefix = "např. "; // Text, který chceš přidat
    const beforeText = randomCategories
        .map(category => {
          // Zkontroluj, jestli logo obsahuje HTML entitu a převedeme ji na emoji
          const decodedLogo = category.category.logo.includes('&#')
            ? String.fromCodePoint(category.category.logo.match(/\d+/)[0])
            : category.category.logo;
    
          return `${category.category.name} ${decodedLogo}`;
        })
        .join(', ');
    
    // Přidání prefixu před všechny položky
    const placeText = `${prefix}${beforeText}`;

  const handleVisibilityChange = () => {
    const divElement = document.querySelector('.addPostSecondStep');
    const isVisible = divElement && getComputedStyle(divElement).display === 'block';
    


    if (isVisible) {
      const storedTypeOfPost = localStorage.getItem('typeOfPost');

      if (
        storedTypeOfPost === process.env.NEXT_PUBLIC_MEDIUM_RANK && storedTypeOfPost === accType||
        storedTypeOfPost === process.env.NEXT_PUBLIC_BASE_RANK  && storedTypeOfPost === accType ||
        storedTypeOfPost === process.env.NEXT_PUBLIC_BEST_RANK  && storedTypeOfPost === accType
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
    maxWidth: "500px", // Set a maximum width
    margin: "0 auto" // Center the component
  }}  
  className="typeOfPosts flex flex-col items-center justify-center gap-2 p-4"
>
  <h3 className="font-bold text-lg">{typeOfPost}</h3>
  <form action="">
    <div className="py-2 w-full"> {/* Make input full width of the container */}
      <label htmlFor="name"  className="block">Co nabízím</label>
      <input type="text" placeholder={placeText} name="name" className="input input-bordered w-full email" required />
    </div>
    <div className="w-full"> 
    <div className="flex items-center mb-4">
                <label htmlFor="price" className="block mr-2">Cena</label>
                <input 
                    type="number" 
                    name="price" 
                    className="input input-bordered w-full email mr-2" 
                    required 
                    value={price} // Controlled input
                    onChange={(e) => setPrice(e.target.value)} // Update state on input change
                    disabled={isDisabled}
                />
                <span className="mx-2">|</span>
                <button 
                    type="button" 
                    onClick={() => handleButtonClick('Dohodou')} 
                    className="btn btn-primary"
                    style={{
                        transition: 'background-color 0.3s, box-shadow 0.3s',
                        boxShadow: activeButton === 'Dohodou' ? 'rgba(0, 255, 0, 0.5) 0px 0px 10px' : 'none',
                        border: activeButton === 'Dohodou' ? '2px solid rgb(13, 84, 8)' : 'none',
                    }}
                >
                    Dohodou
                </button>
                <button 
                    type="button" 
                    onClick={() => handleButtonClick('V textu')} 
                    className="btn btn-primary ml-2"
                    style={{
                        transition: 'background-color 0.3s, box-shadow 0.3s',
                        boxShadow: activeButton === 'V textu' ? 'rgba(0, 255, 0, 0.5) 0px 0px 10px' : 'none',
                        border: activeButton === 'V textu' ? '2px solid rgb(13, 84, 8)' : 'none',
                    }}
                >
                    V textu
                </button>
                <button 
                    type="button" 
                    onClick={() => handleButtonClick('Zdarma')} 
                    className="btn btn-primary ml-2"
                    style={{
                        transition: 'background-color 0.3s, box-shadow 0.3s',
                        boxShadow: activeButton === 'Zdarma' ? 'rgba(0, 255, 0, 0.5) 0px 0px 10px' : 'none',
                        border: activeButton === 'Zdarma' ? '2px solid rgb(13, 84, 8)' : 'none',
                    }}
                >
                    Zdarma
                </button>
            </div>
        
    </div>
    
  </form>
</div>
 
      )}
    </>
  );
};

export default AddUI;