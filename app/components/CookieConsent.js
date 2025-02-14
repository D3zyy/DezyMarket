'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const consentGiven = localStorage.getItem('cookieConsent');
    if (consentGiven !== null) {
      setIsVisible(false); // Pokud už byl souhlas nebo odmítnutí, neukazujeme cookie bar
    }
    setLoaded(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true'); // Uložíme souhlas do localStorage
    setIsVisible(false); // Skryjeme cookie bar
  };

  const handleNotAccept = () => {
    localStorage.setItem('cookieConsent', 'false'); // Uložíme odmítnutí souhlasu do localStorage
    setIsVisible(false); // Skryjeme cookie bar
  };

  const showBanner = () => {
    setIsVisible(true); // Zobrazí banner znovu, i když byl již skrytý
  };

  if (!isVisible) return null;

  return (
    <> 
      {loaded && (
        <>
          <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-base-300 dark:bg-black p-4 rounded-lg flex flex-col md:flex-row gap-4 items-center justify-between md:max-w-[90%] w-9/12 md:w-6/12 shadow-lg z-50">
            <p className="text-sm">Používáme cookies pro zajištění správné funkčnosti webu a analýzu návštěvnosti. Kliknutím na 'Přijmout' souhlasíte s naším použitím cookies. <Link target='_blank' href="/cookies-policy" className="underline">Přečíst více</Link></p>
            <div className="flex flex-row">
              <button 
                onClick={handleNotAccept}
                className="bg-slate-400 mr-2 text-black py-2 px-4 rounded-lg text-sm hover:bg-slate-300 focus:outline-none focus:ring-2 focus:bg-slate-300">
                Odmítnout
              </button>
              <button 
                onClick={handleAccept}
                className="bg-slate-400 text-black py-2 px-4 rounded-lg text-sm hover:bg-slate-300 focus:outline-none focus:ring-2 focus:bg-slate-300">
                Přijmout
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default CookieConsent;