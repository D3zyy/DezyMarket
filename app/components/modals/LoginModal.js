"use client";

import Link from 'next/link';
import React, { useState } from 'react';

export function openLoginModal() {
  document.getElementById('login_modal').showModal();
}

const handleLogin = async (event, setError, setLoading) => {
  event.preventDefault();

  setLoading(true);

  const formData = new FormData(event.target);
  const email = formData.get('email');
  const password = formData.get('password');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setError('Neplatný formát emailu.');
    setLoading(false);
    return;
  }

  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (res.ok) {
      window.location.reload();
    } else {
      const errorData = await res.json();
      if (errorData.message == "Váš účet byl trvale zablokován") {
        setError(
          <span>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                marginBottom: "10px",
                display: 'inline-block',
                width: '50px',
                height: '50px',
                background: 'linear-gradient(to right, #f54b42 50%, #e02e24 50%)',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
              }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '20%',
                    backgroundColor: '#e2e2e2',
                    transform: 'rotate(45deg)'
                  }}></div>
                  <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '20%',
                    backgroundColor: '#e2e2e2',
                    transform: 'rotate(-45deg)'
                  }}></div>
                </div>
              </div>
            </div>
            Váš účet byl trvale zablokován. Pokud si myslíte, že došlo k omylu, kontaktujte nás prosím.{' '}
            <Link href="/kontakty" style={{ color: 'gray', textDecoration: 'underline' }} target="_blank">Kontakty</Link>
          </span>
        );
        console.error('Chyba při přihlašování:', errorData.message);
      } else if (errorData.message.includes("Účet byl zabanován do:")) {
        setError(
          <div style={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                marginRight: "20px",
                marginBottom: "10px",
                display: 'inline-block',
                width: '50px',
                height: '50px',
                background: 'linear-gradient(to right, #f54b42 50%, #e02e24 50%)',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
              }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '20%',
                    backgroundColor: '#e2e2e2',
                    transform: 'rotate(45deg)'
                  }}></div>
                  <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '20%',
                    backgroundColor: '#e2e2e2',
                    transform: 'rotate(-45deg)'
                  }}></div>
                </div>
              </div>
            </div>
            <div style={{ marginLeft: "5px" }}>{errorData.message}</div>
          </div>
        );
        console.error('Chyba při přihlašování:', errorData.message);
      } else {
        setError(errorData.message || 'Chyba při přihlašování.');
        console.error('Chyba při přihlašování:', errorData.message);
      }
    }
  } catch (err) {
    setError('Nastala chyba při přihlašovaní, zkuste to prosím později.');
    console.error('Nastala chyba při přihlašování:', err);
  } finally {
    setLoading(false);
  }
};

const handleRecovery = async (event, setError, setLoading) => {
  event.preventDefault();

  setLoading(true);

  const formData = new FormData(event.target);
  const email = formData.get('email');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setError('Neplatný formát emailu.');
    setLoading(false);
    return;
  }

  try {
    const res = await fetch('/api/email/recovery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    if (res.ok) {
      setError('Pokyny k obnovení hesla byly odeslány na váš email.');
    } else {
      const errorData = await res.json();
      setError(errorData.message || 'Chyba při odesílání požadavku na obnovení hesla.');
      console.error('Chyba při odesílání požadavku na obnovení hesla:', errorData.message);
    }
  } catch (err) {
    setError('Nastala chyba při odesílání požadavku na obnovení hesla, zkuste to prosím později.');
    console.error('Nastala chyba při odesílání požadavku na obnovení hesla:', err);
  } finally {
    setLoading(false);
  }
};

const RecoveryButton = ({ setRecoverPassword }) => (
  <button
    className="btn btn-link"
    onClick={() => setRecoverPassword(true)}
    style={{ color: 'gray' }}
  >
    Obnovit heslo
  </button>
);

const BackToLoginButton = ({ setRecoverPassword }) => (
  <button
    className="btn btn-link"
    onClick={() => setRecoverPassword(false)}
    style={{ color: 'gray', marginLeft: 'auto' }}
  >
    Zpět na přihlášení
  </button>
);

const LoginModal = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recoverPassword, setRecoverPassword] = useState(false);

  return (
    <>  
      <dialog id="login_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          {error && <div style={{ color: 'red', marginBottom: "10px" }}>{error}</div>}
          <h3 className="font-bold text-lg">{recoverPassword ? 'Obnovení hesla' : 'Přihlášení'}</h3>
          <form onSubmit={(event) => recoverPassword ? handleRecovery(event, setError, setLoading) : handleLogin(event, setError, setLoading)}>
            <div className="py-4">
              <label htmlFor="email" className="block">Email</label>
              <input type="email" name="email" className="input input-bordered w-full email" required />
            </div>
            {!recoverPassword && (
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
            )}
            <div className="modal-action">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Načítání...' : recoverPassword ? 'Odeslat' : 'Přihlásit se'}
              </button>
              <button type="button" className="btn" onClick={() => document.getElementById('login_modal').close()}>Zavřít</button>
            </div>
          </form>
          {recoverPassword ? (
            <BackToLoginButton setRecoverPassword={setRecoverPassword} />
          ) : (
            <RecoveryButton setRecoverPassword={setRecoverPassword} />
          )}
        </div>
      </dialog>
    </>
  );
};

export default LoginModal;