"use client"
import React from 'react'

const handleLogout = async (event) => {
    event.preventDefault();
    
    try {
      const res = await fetch('/api/session', { method: 'DELETE' });
      if (res.ok) {
        window.location.reload(); 
      } else {
        window.location.reload(); 
        console.error('Chyba při odhlašovaní :', res.statusText);
      }
    } catch (err) {
        window.location.reload(); 
      console.error('Nastala chyba při odhlašování :', err);
    }
  };


const LogOutButton = () => {
  return (
    <>
           <li><form onClick={handleLogout}><button type="submit" >Odhlásit se</button></form></li> 
    </>
  )
}

export default LogOutButton