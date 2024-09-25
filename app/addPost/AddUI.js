"use client";
import React, { useEffect, useState } from 'react';

const AddUI = () => {
  const [typeOfAccount, setTypeOfAccount] = useState(null);

  const handleVisibilityChange = () => {
    const divElement = document.querySelector('.addPostSecondStep');
    const isVisible = divElement && getComputedStyle(divElement).display === 'block';

    if (isVisible) {
      const storedTypeOfAccount = localStorage.getItem('typeOfAccount');

      if (
        storedTypeOfAccount === process.env.NEXT_PUBLIC_MEDIUM_RANK ||
        storedTypeOfAccount === process.env.NEXT_PUBLIC_BASE_RANK ||
        storedTypeOfAccount === process.env.NEXT_PUBLIC_BEST_RANK
      ) {
        setTypeOfAccount(storedTypeOfAccount);
      } else {
        setTypeOfAccount(process.env.NEXT_PUBLIC_BASE_RANK);
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
      {typeOfAccount && (
        <div>
          Druhý krok přidání příspěvku pro účet: {typeOfAccount}
        </div>
      )}
    </>
  );
};

export default AddUI;