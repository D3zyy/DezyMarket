"use client"
import { login } from '@/app/authentication/actions';

import React from 'react';


const handleLogin = async (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);
  const email = formData.get('email');
  const password = formData.get('password');

  try {
    const res = await fetch('/api/session/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (res.ok) {
      window.location.reload(); // Reload the page after logging in
    } else {
      const errorData = await res.json();
      console.error('Chyba při přihlašování:', errorData.message);
    }
  } catch (err) {
    console.error('Nastala chyba při přihlašování:', err);
  }
};

 
const LoginModal =  () => {
 


  return (
    <>
      
      <dialog id="login_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Přihlášení</h3>
          <form onSubmit={handleLogin} >
            <div className="py-4">
              <label htmlFor="email" className="block">Email</label>
              <input type="email" name='email'  className="input input-bordered w-full email" required />
            </div>  
            <div className="py-4">
              <label htmlFor="password" className="block">Heslo</label>
              <input type="password" autoComplete="true" name='password' className="input input-bordered w-full password" required />
            </div>
            <div className="modal-action">
              <button  type="submit" className="btn btn-primary">Přihlásit se</button>
              <button type="button" className="btn" onClick={() => document.getElementById('login_modal').close()}>Zavřít</button>
            </div>
          </form>
          <button className="btn btn-link" onClick={() => {
            document.getElementById('login_modal').close();
            document.getElementById('register_modal').showModal();
          }}>Registrace</button>
        </div>
      </dialog>
    </>
  );
};

export default LoginModal;