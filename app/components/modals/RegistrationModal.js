'use client';

import React from 'react';
import { handleRegistration } from '@/app/authentication/registration/actions';
import { useFormState } from 'react-dom';
import { SubmitButton } from '../SubmitButton';

const initialState = {
  message: null,
};

export function openRegisterModal() {
  document.getElementById('register_modal').showModal();
}

const translateField = (field) => {
  const translations = {
    email: 'Email',
    password: 'Heslo',
    firstName: 'Jméno',
    lastName: 'Příjmení',
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
    return <span>{message}</span>;
  }
};

const RegistrationModal = () => {
  const [state, formAction] = useFormState(handleRegistration, initialState);

  return (
    <>
      <dialog id="register_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <div style={{ color: "red" }}>
            {state?.message && parseErrors(state.message)}
          </div>

          <h3 className="font-bold text-lg">Registrace</h3>
          <form action={formAction}>
            <div className="py-2">
              <label htmlFor="firstName" className="block">Jméno</label>
              <input type="text" id="firstName" name="firstName" className="input input-bordered w-full" required />
            </div>
            <div className="py-2">
              <label htmlFor="lastName" className="block">Příjmení</label>
              <input type="text" id="lastName" name="lastName" className="input input-bordered w-full" required />
            </div>
            <div className="py-2">
              <label htmlFor="lastName" className="block">Přezdívka</label>
              <input type="text" id="lastName" name="nickname" className="input input-bordered w-full" required />
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
        </div>
      </dialog>
    </>
  );
};

export default RegistrationModal;