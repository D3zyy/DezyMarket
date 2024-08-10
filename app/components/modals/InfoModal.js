"use client";

import { CheckCircleIcon, XCircleIcon , LockClosedIcon} from '@heroicons/react/24/solid';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { openRegisterModal } from './RegistrationModal';


export function openInfoModal() {
  document.getElementById('info_modal').showModal();
}

const handleLogin = async (event, setError, setLoading, setSuccess,setMessageProp,setFirstLogin) => {
  event.preventDefault();
  
  setLoading(true);
  setMessageProp(false)
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
      setFirstLogin(result.firstLoggin)
      setSuccess(true);
    } else {
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
                <Link href="/kontakty" style={{ color: 'gray', textDecoration: 'underline' }} target="_blank">Kontakty</Link>
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
                <Link href="/kontakty" style={{ color: 'gray', textDecoration: 'underline' }} target="_blank">Kontakty</Link>
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
    setError('Nastala chyba při přihlašovaní, zkuste to prosím později.');
    console.error('Nastala chyba při přihlašování:', err);
  } finally {
    setLoading(false);
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
      setSuccess(<div style={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
        <CheckCircleIcon className="h-8 w-8 text-green-500"  style={{marginRight: "10px"}}/>
        <div style={{ marginLeft: "5px" }}>{'Pokyny k obnovení hesla byli zaslány na uvedený email'}</div>
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
    }
  } catch (err) {
    setError('Nastala chyba při odesílání požadavku na obnovení hesla, zkuste to prosím později.');
    console.error('Nastala chyba při odesílání požadavku na obnovení hesla:', err);
  } finally {
    setLoading(false);
  }
};

const RecoveryButton = ({ setRecoverPassword, setSuccess, setError, setMessageProp }) => (
  <button
    className="btn btn-link"
    onClick={() => {
      setRecoverPassword(true);
      setSuccess(false);
      setError(false);
      setMessageProp(false);
    }}
    onTouchStart={() => {
      setRecoverPassword(true);
      setSuccess(false);
      setError(false);
      setMessageProp(false);
    }}
    style={{ color: 'gray' }}
  >
    Obnovit heslo
  </button>
);

const BackToLoginButton = ({ setRecoverPassword, setSuccess, setError ,setMessageProp}) => (
  <button
    className="btn btn-link"
    onClick={() => {
      setRecoverPassword(false);
      setSuccess(false);
      setError(false);
      setMessageProp(false);
    }}
    onTouchStart={() => {
      setRecoverPassword(true);
      setSuccess(false);
      setError(false);
      setMessageProp(false);
    }}
    style={{ color: 'gray', marginLeft: 'auto' }}
  >
    Zpět na přihlášení
  </button>
);

const InfoModal = ({ defaultOpen, message }) => {
  useEffect(() => {
    const dialog = document.getElementById('info_modal');
    
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault(); // Prevent closing the dialog on ESC key press
      }
    };

    if (dialog) {
      dialog.addEventListener('keydown', handleKeyDown);
      return () => {
        dialog.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, []);
  const [success, setSuccess] = useState(false);
  const [messageProp, setMessageProp] = useState(message);
  const [firstLogin, setFirstLogin] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recoverPassword, setRecoverPassword] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    if (defaultOpen) {
      document.getElementById('info_modal').showModal();
    }
    if (success && !recoverPassword) {
      if(firstLogin){
        router.push("/")
      }
      router.refresh();
      router.refresh();
    }
  }, [success, recoverPassword, router ]);
   
  return (

    <>  


    <style jsx global>{`
      dialog::backdrop {
        background: rgba(0, 0, 0, 0.5); /* Semi-transparent black background */
        backdrop-filter: blur(2px); /* Apply blur effect */
      }
    `}</style>
    <dialog id="info_modal" className="modal modal-bottom sm:modal-middle">
      <div className="modal-box">
        {error && <div style={{ color: 'red', marginBottom: "10px" }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBottom: "10px" }}>{success}</div>}
        {messageProp && (
        <div style={{ display: 'flex', alignItems: 'center', color: '#676b1c', marginBottom: '10px' }}>
            <LockClosedIcon className="h-10 w-10 text-yellow-500" style={{ marginRight: '10px' }} />
            <div>{messageProp}</div>
        </div>
        )}
        <h3 className="font-bold text-lg">{recoverPassword ? 'Obnovení hesla' : 'Přihlášení'}</h3>
        <form onSubmit={(event) => recoverPassword ? handleRecovery(event, setError, setLoading, setSuccess) : handleLogin(event, setError, setLoading, setSuccess, setMessageProp,setFirstLogin)}>
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
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Načítání...' : recoverPassword ? 'Odeslat' : 'Přihlásit se'}
              </button>
            )}
                <button 
                type="button" 
                className="btn" 
                onClick={() => {
                    document.getElementById('info_modal').close(); 
                    router.push("/");
                }}
                onTouchStart={() => {
                  document.getElementById('info_modal').close(); 
                  router.push("/");
              }}
                >
                Zavřít
                </button>
          </div>
        </form>
       
        {recoverPassword ? (
          <BackToLoginButton 
            setRecoverPassword={setRecoverPassword} 
            setSuccess={setSuccess} 
            setError={setError} 
            setMessageProp = {setMessageProp}
          />
        ) : (
          <>
          
          <RecoveryButton 
            setRecoverPassword={setRecoverPassword} 
            setSuccess={setSuccess} 
            setError={setError} 
            setMessageProp = {setMessageProp}
          />
        <div style={{ display: 'flex', alignItems: 'center' }}>
    <span style={{ textDecoration: 'none', color: 'gray', padding: "0px 16px"}}>
        Ještě nemáte účet?
    </span>
    <button
        className="btn btn-link"
        style={{padding: "0px"}}
        onClick={ () => {
          router.push("/");
          document.getElementById('info_modal').close(); 
          openRegisterModal()
        }}
        onTouchStart={() => {
          router.push("/");
          document.getElementById('info_modal').close(); 
          openRegisterModal()
        }}
    >
        Registrace
    </button>
</div>
          </>
        )}
      </div>
    </dialog>
  </>
  );
};
export default InfoModal