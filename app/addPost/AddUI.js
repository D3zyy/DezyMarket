"use client";
import React, { useEffect, useState } from 'react';

const AddUI = ({accType,userCategories}) => {
  const [typeOfPost, setTypeOfPost] = useState(null);
  function decodeHTMLEntities(text) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
  }
  function getRandomCategories(categories, count) {
    const shuffled = [...categories].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
    const randomCategories = userCategories.length
    ? getRandomCategories(userCategories, 3)
    : [{ category: { name: 'Sluchátka', logo: '🎧' } }]; // Výchozí hodnota, pokud je pole prázdné

    // Spojení názvů a log do jednoho stringu
    const prefix = ".. "; // Text, který chceš přidat
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
    <label htmlFor="price"  className="block">Cena</label>
        <input type="number" name="price"  className="input input-bordered w-full email" required/> <span>nebo</span> 
    </div>
    
  </form>
</div>
 
      )}
    </>
  );
};

export default AddUI;