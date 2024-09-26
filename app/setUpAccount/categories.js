"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// Funkce pro zpracování změny
async function changeValue(id, isChecked) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/categories`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, isChecked })
  });
  
  if (!res.ok) {
    // Vyhoď chybu, pokud odpověď není OK
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }

  return res.json(); // Vrátí response json
}

const Categories = ({ name, id, isChecked: initialIsChecked, logo }) => {
  const [isChecked, setIsChecked] = useState(initialIsChecked);
  const [error, setError] = useState(null); // Stav pro chyby
  const router = useRouter();

  // Funkce, která se volá při kliknutí na label
  const handleChange = async () => {
    const newChecked = !isChecked; // Přepni stav
    try {
      await changeValue(id, newChecked); // Volání funkce changeValue s id a novým stavem
      setIsChecked(newChecked); // Aktualizuj místní stav
      router.refresh(); // Refresh stránky
    } catch (error) {
      console.error('Chyba aktualizace kategorie:', error);
      setError(error.message); // Nastav chybu do stavu
    }
  };

  return (
    <div >
      {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>} {/* Zobraz chybu */}
      <label  className='btn btn-active'
        onClick={handleChange}
        style={{
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          borderRadius: '5px',
          transition: 'background-color 0.3s, box-shadow 0.3s',
          boxShadow: isChecked ? '0 0 10px var(--fallback-p,oklch(var(--p)/var(--tw-bg-opacity)))' : 'none', // Světelný efekt pokud je zaškrtnuto
        // Zelený border pro zaškrtnutý stav, šedý pro ne
        }}
      >
        <span style={{ fontSize: "30px" }} dangerouslySetInnerHTML={{ __html: logo }} /> {name}
        <input type="hidden" name="id" value={id} />
      </label>
    </div>
  );
};

export default Categories;