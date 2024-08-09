"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

const LogOutButton = () => {
  const router = useRouter(); // Move useRouter inside the component

  const handleLogout = async (event) => {
    event.preventDefault();

    try {
      const res = await fetch('/api/session', { method: 'DELETE' });
      if (res.ok) {
        router.push("/"); // Redirect after successful logout
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
    <li>
      <form onSubmit={handleLogout}>
        <button type="submit">Odhlásit se</button>
      </form>
    </li>
  );
};

export default LogOutButton;