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
        <div>
          Druhý krok přidání příspěvku pro : {typeOfPost}
        </div>
      )}
    </>
  );
};

export default AddUI;