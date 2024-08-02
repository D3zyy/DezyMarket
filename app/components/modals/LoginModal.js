"use client";

import React, { useState } from 'react';

export function openLoginModal() {
  document.getElementById('login_modal').showModal();
}

const handleLogin = async (event, setError) => {
  event.preventDefault();

  const formData = new FormData(event.target);
  const email = formData.get('email');
  const password = formData.get('password');

   // checkin valid format of email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setError('Neplatný formát emailu.');
    return;
  }
  // loggin in
  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    //if ok reload page because user alreaddy has a session in his browser
    if (res.ok) {
      window.location.reload(); 
    } else { // error from server showing to the client
      const errorData = await res.json();
      setError(errorData.message || 'Chyba při přihlašování.');
      console.error('Chyba při přihlašování:', errorData.message);
    }
  } catch (err) {
    setError('Nastala chyba při přihlašovaní, zkuste to prosím později.');
    console.error('Nastala chyba při přihlašování:', err);
  }
};

const LoginModal = () => {
  const [error, setError] = useState(null);

  return (
    <>
      <dialog id="login_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          {error && <div style={{ color: 'red', marginBottom: "10px" }}>{error}</div>}
          <h3 className="font-bold text-lg">Přihlášení</h3>
          <form onSubmit={(event) => handleLogin(event, setError)}>
            <div className="py-4">
              <label htmlFor="email" className="block">Email</label>
              <input type="email" name="email" className="input input-bordered w-full email" required />
            </div>
            <div className="py-4">
              <label htmlFor="password" className="block">Heslo</label>
              <input
                type="password"
                name="password"
                autoComplete="on" 
                className="input input-bordered w-full password"
                required
              />
            </div>
            <div className="modal-action">
              <button type="submit" className="btn btn-primary">Přihlásit se</button>
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