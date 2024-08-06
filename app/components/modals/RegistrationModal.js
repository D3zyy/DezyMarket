'use client';

import React, { useEffect, useState } from 'react';
import { handleRegistration } from '@/app/authentication/registration/actions';
import { useFormState } from 'react-dom';
import { SubmitButton } from '../SubmitButton';
import { CheckCircleIcon , InboxArrowDownIcon} from '@heroicons/react/24/solid';

const initialState = {
  message: null,
  closeModal: false,
  email: null,
  password: null,
};

export function openRegisterModal() {
  document.getElementById('register_modal').showModal();
}

 const translateField = (field) => {
  const translations = {
    email: 'Email',
    password: 'Heslo',
    fullName: 'Celé jméno',
    nickname: 'Přezdívka',
    termsOfUseAndPrivatePolicy: 'Podmínky použití a zásady ochrany osobních údajů'
  };
  return translations[field] || field;
};

 const parseErrors = (message) => {
  try {
    const errors = JSON.parse(message);
    return Object.entries(errors).map(([field, messages]) => (
      <div key={field}>
        <strong>{translateField(field)}</strong>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    ));
  } catch {
    if (message === "Email již existuje.") {
      return (
        <span>
          {message}
          <button style={{ color: "gray", textDecoration: "underline", marginLeft: "10px" }} onClick={() => {
            document.getElementById('register_modal').close();
            document.getElementById('login_modal').showModal();
          }}> Přihlásit se</button>
        </span>
      );
    } else {
      return <span>{message}</span>;
    }
  }
};

const RegistrationModal = () => {
  const [state, formAction] = useFormState(handleRegistration, initialState);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  


  useEffect(() => {
    if (state?.closeModal ) {
      // Set success state to true
      setRegistrationSuccess(true);
    }
  }, [state?.closeModal]);

  return (
    <>
      <dialog id="register_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          {registrationSuccess ? (
            <div className="text-center">
            <div className="flex justify-center mb-4">
            <InboxArrowDownIcon className="w-16 h-16 text-yellow-500" />
              
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Dokončete svoji registraci!</h3>
            <p className="text-lg text-gray-600">Ověřovací email  byl zaslán na vaši emailovou adresu.</p>
            <div className="modal-action mt-4">
              <button type="button" className="btn btn-primary" onClick={() => document.getElementById('register_modal').close()}>Zavřít</button>
            </div>
          </div>
          ) : (
            <>
              <div style={{ color: "red" }}>
                {state?.message && parseErrors(state.message)}
            
              </div>

              <h3 className="font-bold text-lg">Registrace</h3>
              

              <form action={formAction}>
                <div className="py-2">
                  <label htmlFor="fullName" className="block">Celé jméno</label>
                  <input type="text" id="fullName" name="fullName" className="input input-bordered w-full" required />
                </div>
                <div className="py-2">
                  <label htmlFor="nickname" className="block">Přezdívka</label>
                  <input type="text" id="nickname" name="nickname" className="input input-bordered w-full" required />
                </div>
                <div className="py-2">
                  <label htmlFor="email" className="block">Email</label>
                  <input type="email" name="email" className="input input-bordered w-full" required />
                </div>
                <div className="py-2">
                  <label htmlFor="password" className="block">Heslo</label>
                  <input type="password" name="password" autoComplete="on" className="input input-bordered w-full" required />
                </div>
                <div className="py-2">
                  <label className="cursor-pointer">
                    <input type="checkbox" name="termsOfUseAndPrivatePolicy" className="checkbox checkbox-primary" required />
                    <span className="label-text"> Souhlasím se <a href="/termsOfUse" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Všeobecnými podmínkami použití</a> a <a href="/privacyPolicy" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Zásadami zpracování osobních údajů</a></span>
                  </label>
                </div>
                <div className="modal-action">
                  <SubmitButton />
                  <button type="button" className="btn" onClick={() => document.getElementById('register_modal').close()}>Zavřít</button>
                </div>
              </form>
            </>
          )}
        </div>
      </dialog>
    </>
  );
};

export default RegistrationModal;