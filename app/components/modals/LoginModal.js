"use client";

import { CheckCircleIcon, XCircleIcon , LockClosedIcon} from '@heroicons/react/24/solid';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { openRegisterModal } from './RegistrationModal';
export function openLoginModal() {
  try{
    const modal =   document.getElementById('login_modal');
    if (modal) {
        modal.showModal();
    }  

}catch (error) {
    console.error("Chyba otevírání modalu:", error);
    
  }

}

const handleLogin = async (event, setError, setLoading, setSuccess) => {
  event.preventDefault();
  
  setLoading(true);

  const formData = new FormData(event.target);
  const email = formData.get('email');
  const password = formData.get('password');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setError(<div style={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
      <XCircleIcon className="h-8 w-8 text-red-500"  style={{marginRight: "10px"}}/>
      <div style={{ marginLeft: "5px" }}>{'Neplatný formát emailu'}</div>
    </div>);
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
      let result = await res.json()
      setSuccess(true);
    } else {
      setLoading(false);
      const errorData = await res.json();
      if (errorData.message.includes("Váš účet byl trvale zablokován")) {
        setError(
          <span>
            <div className="container_row" style={{display: "grid"}}>
              <div className="layer1" style={{gridColumn: 1, gridRow: 1}}>
                <XCircleIcon className="h-12 w-12 text-red-500"  style={{marginBottom: "10px"}}/>
              </div>
              <div className="layer2">
                {errorData.message}{' '}
                <Link href="/support" style={{ color: 'gray', textDecoration: 'underline' }} target="_blank">Podpora</Link>
              </div>
            </div>
          </span>
        );
        console.error('Chyba při přihlašování:', errorData.message);
      } else if (errorData.message.includes("Účet byl zablokován do:")) {
        setError(
          <span>
            <div className="container_row" style={{display: "grid"}}>
              <div className="layer1" style={{gridColumn: 1, gridRow: 1}}>
                <XCircleIcon className="h-12 w-12 text-red-500"  style={{marginBottom: "10px"}}/>
              </div>
              <div className="layer2">
                {errorData.message}{' '}
                <Link href="/support" style={{ color: 'gray', textDecoration: 'underline' }} target="_blank">Podpora</Link>
              </div>
            </div>
          </span>
        );
        console.error('Chyba při přihlašování:', errorData.message);
      } else {
        setError(
          <div style={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
            <XCircleIcon className="h-8 w-8 text-red-500"  style={{marginRight: "10px"}}/>
            <div style={{ marginLeft: "5px" }}>{errorData.message || 'Chyba při přihlašování.'}</div>
            {console.error('Chyba při přihlašování:', errorData.message)}
          </div>
        );
      } 
    }
  } catch (err) {
    setLoading(false);
    setError('Nastala chyba při přihlašovaní, zkuste to prosím později.');
    console.error('Nastala chyba při přihlašování:', err);
  } 
};

const handleRecovery = async (event, setError, setLoading, setSuccess) => {
  event.preventDefault();

  setLoading(true);

  const formData = new FormData(event.target);
  const email = formData.get('email');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setError(<div style={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
      <XCircleIcon className="h-8 w-8 text-red-500"  style={{marginRight: "10px"}}/>
      <div style={{ marginLeft: "5px" }}>{'Neplatný formát emailu.'}</div>
    </div>);
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
      setError(false);
      setLoading(false)
      setSuccess(<div style={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
        <CheckCircleIcon className="h-8 w-8 text-green-500"  style={{marginRight: "10px"}}/>
        <div style={{ marginLeft: "5px" }}>{'Pokyny byly odeslány, pokud je e-mail registrován'}</div>
      </div>);
    } else {
      const errorData = await res.json();
      setError(
        <div style={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
          <XCircleIcon className="h-8 w-8 text-red-500"  style={{marginRight: "10px"}}/>
          <div style={{ marginLeft: "5px" }}>{errorData.message || 'Chyba při odesílání požadavku na obnovení hesla.'}</div>
          {console.error('Chyba při odesílání požadavku na obnovení hesla.', errorData.message)}
        </div>
      );
      setLoading(false)
    }
  } catch (err) {
    setError('Nastala chyba při odesílání požadavku na obnovení hesla, zkuste to prosím později.');
    console.error('Nastala chyba při odesílání požadavku na obnovení hesla:', err);
  } 
};

const RecoveryButton = ({ setRecoverPassword, setSuccess, setError }) => (
  <button
    className="btn btn-link"
    onClick={() => {
      setRecoverPassword(true);
      setSuccess(false);
      setError(false);
    }}
    onTouchStart={() => {
      setRecoverPassword(true);
      setSuccess(false);
      setError(false);
    }}

    style={{ color: 'gray' }}
  >
    Obnovit heslo
  </button>
);

const BackToLoginButton = ({ setRecoverPassword, setSuccess, setError, setLoading }) => (
  <button
    className="btn btn-link"
    onClick={() => {
      setRecoverPassword(false);
      setSuccess(false);
      setError(false);
      setLoading(false);
    }}
    onTouchStart={() => {
      setRecoverPassword(false);
      setSuccess(false);
      setError(false);
      setLoading(false);
    }}

    style={{ color: 'gray', marginLeft: 'auto' }}
  >
    Zpět na přihlášení
  </button>
);

const LoginModal = () => {

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recoverPassword, setRecoverPassword] = useState(false);
  const router = useRouter();


  useEffect(() => {

    if (success && !recoverPassword) {
      
       
      
      router.refresh();
    }
  }, [success, recoverPassword, router]);

  return (

    <>  

  
    <dialog id="login_modal" className="bg-slate-950/40 modal modal-bottom sm:modal-middle">
   
      <div className="modal-box">
        {error && <div style={{ color: 'red', marginBottom: "10px" }}>{error}</div>}
        {success &&recoverPassword && <div style={{ color: 'green', marginBottom: "10px" }}>{success}</div>}

  
        <h3 className="font-bold text-lg">{recoverPassword ? 'Obnovení hesla' : 'Přihlášení'}</h3>
        <form
  onSubmit={(event) => {
    if (success) {
      event.preventDefault(); // Prevent the form from submitting if success is true
      return;
    }
    recoverPassword
      ? handleRecovery(event, setError, setLoading, setSuccess)
      : handleLogin(event, setError, setLoading, setSuccess);
  }}
>
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
            {!success && (
              <button type="submit" className="btn btn-primary" disabled={loading || success}>
                {loading ? <span className="loading loading-spinner loading-sm"></span>  : recoverPassword ? 'Odeslat' : 'Přihlásit se'}
              </button>
            )}
            <button disabled={loading} type="button" className="btn" onClick={() => document.getElementById('login_modal').close()} onTouchStart={() => document.getElementById('login_modal').close()}>Zavřít</button>
          </div>
        </form>
        {recoverPassword ? (
          <BackToLoginButton 
            setRecoverPassword={setRecoverPassword} 
            setSuccess={setSuccess} 
            setError={setError} 
            setLoading={setLoading}
          />
        ) : (
          <RecoveryButton 
            setRecoverPassword={setRecoverPassword} 
            setSuccess={setSuccess} 
            setError={setError} 
          />
        )}
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ textDecoration: 'none', color: 'gray', padding: "0px 16px"}}>
                Ještě nemáte účet?
            </span>
            <button
                className="btn btn-link"
                style={{padding: "0px", color: "#a063ff"}}
                onClick={ () => {
                
                  document.getElementById('login_modal').close(); 
                  openRegisterModal()
                }}
                onTouchStart={() => {
                  
                  document.getElementById('login_modal').close(); 
                  openRegisterModal()
                }}
            >
                Registrace
            </button>
        </div>
      </div>
    </dialog>
  </>
  );
};
export default LoginModal