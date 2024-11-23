"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

const LogOutButton = () => {
  const router = useRouter(); 

  const handleLogout = async () => {


    try {
      const res = await fetch('/api/session', { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      } else {
        console.error('Chyba při odhlašovaní :', res.statusText);
        router.push("/"); // Redirect even if there is an error
        router.refresh();
      }
    } catch (err) {
      console.error('Nastala chyba při odhlašování :', err);
      router.push("/"); // Reload the page on error
      router.refresh();
    }
  };

  return (
 

        <button onClick={handleLogout} onTouchStart={handleLogout} type="submit">Odhlásit se</button>

  
  );
};

export default LogOutButton;