"use client"
import React, { useState, useEffect } from 'react';

function CookiePolicyPage() {
  const [cookieConsent, setCookieConsent] = useState({
    technical: true, // Technické cookies jsou vždy zapnuté a disabled
    analytics: false, // Výchozí stav analytických cookies je vypnutý
  });

  // Zkontrolujeme, zda je souhlas nebo odmítnutí uloženo v localStorage
  useEffect(() => {
    const consentGiven = localStorage.getItem('cookieConsent');
    if (consentGiven) {
      setCookieConsent(prevState => ({
        ...prevState,
        analytics: consentGiven === 'accepted' ? true : false, // Nastavíme analytické cookies podle uloženého souhlasu
      }));
    }
  }, []);

  const handleAnalyticsChange = (event) => {
    const consent = event.target.checked ? 'accepted' : 'rejected';
    localStorage.setItem('cookieConsent', consent); // Uložíme změněný souhlas
    setCookieConsent(prevState => ({ ...prevState, analytics: event.target.checked }));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Cookies nastavení</h1>
      <p className="mb-4">
        Na této stránce vás informujeme o tom, jak používáme cookies. Cookies jsou malé soubory, které se ukládají na vaše zařízení, aby nám pomohly vylepšit uživatelský zážitek, zajišťovat správnou funkčnost webu a analyzovat návštěvnost.
      </p>
      
      <h2 className="text-xl font-semibold mb-2 mt-2">Technické cookies</h2>
      <p className="mb-4">
        Tyto cookies jsou nezbytné pro správné fungování webu. Umožňují vám například navigaci po stránkách, přihlášení nebo zapamatování vašich nastavení. Tyto cookies jsou automaticky zapnuté a nelze je vypnout.
      </p>
      <div className="flex items-center space-x-4 mb-4 mt-2">
        <label htmlFor="analytics" className="text-sm">Technické cookies:</label>
        <input
          id="analytics"
          type="checkbox"
          className="toggle"
          disabled
          checked
        />
      </div>

      <h2 className="text-xl font-semibold mb-2">Analytické cookies</h2>
      <p className="mb-4">
        Používáme analytické cookies pro analýzu návštěvnosti webu. Tyto cookies nám pomáhají shromažďovat informace o tom, jak návštěvníci používají náš web, které stránky navštěvují, jak dlouho se na stránkách zdržují a další statistické údaje. Tato data nám umožňují vylepšovat naše služby a webovou stránku.
      </p>

     

      <div className="flex items-center space-x-4 mb-4">
        <label htmlFor="analytics" className="text-sm">Analitické cookies:</label>
        <input
          id="analytics"
          type="checkbox"
          className="toggle"
          checked={cookieConsent.analytics === true}
          onChange={handleAnalyticsChange}
        />
      </div>
    </div>
  );
}

export default CookiePolicyPage;