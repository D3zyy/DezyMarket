"use client";
import React, { useEffect, useState } from 'react';

const AddUI = ({accType}) => {
  const [typeOfPost, setTypeOfPost] = useState(null);

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
      <input type="text" placeholder='..Iphone 15&#128241; ..Dům&#127968; ..Čepici&#129506;' name="name" className="input input-bordered w-full email" required />
    </div>
    <div className="w-full"> 
    <label htmlFor="price"  className="block">Cena</label>
        <input type="number" name="price"  className="input input-bordered w-full email" required/> nebo 
    </div>
    
  </form>
</div>
 
      )}
    </>
  );
};

export default AddUI;