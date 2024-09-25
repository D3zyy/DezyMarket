"use client";
import React, { useEffect, useState } from 'react';

const AddUI = () => {
  const [typeOfAccount, setTypeOfAccount] = useState(null);

  // Funkce, která se spustí při zobrazení divu
  const handleVisibilityChange = () => {
    const divElement = document.querySelector('.addPostSecondStep');

    // Zjistíme, zda je div zobrazen
    const isVisible = divElement && getComputedStyle(divElement).display === 'block';

    if (isVisible) {
      // Načteme hodnotu z localStorage
      const storedTypeOfAccount = localStorage.getItem('typeOfAccount');
      setTypeOfAccount(storedTypeOfAccount);
    }
  };

  useEffect(() => {
    // Sledujeme změnu viditelnosti
    const observer = new MutationObserver(handleVisibilityChange);
    const targetNode = document.querySelector('.addPostSecondStep');

    if (targetNode) {
      observer.observe(targetNode, { attributes: true, attributeFilter: ['style'] });
    }

    // Vyčistíme observer, když se komponenta odmontuje
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