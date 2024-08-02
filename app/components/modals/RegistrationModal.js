"use client"
import React from 'react';


export function openRegisterModal() {
  document.getElementById('register_modal').showModal();
}
const RegistrationModal = ({ handleRegister }) => {
  return (
    <>
      
      <dialog id="register_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Registrace</h3>
          <form onSubmit={handleRegister}>
            <div className="py-2">
              <label htmlFor="firstName" className="block">Jméno</label>
              <input type="text" id="firstName" className="input input-bordered w-full" required />
            </div>
            <div className="py-2">
              <label htmlFor="lastName" className="block">Příjmení</label>
              <input type="text" id="lastName" className="input input-bordered w-full" required />
            </div>
            <div className="py-2">
              <label htmlFor="email" className="block">Email</label>
              <input type="email"  className="input input-bordered w-full email" required />
            </div>
            <div className="py-2">
              <label htmlFor="password" className="block">Heslo</label>
              <input type="password"  autoComplete="on"  className="input input-bordered w-full password" required />
            </div>
            <div className="py-2">
              <label className="cursor-pointer">
                <input type="checkbox" className="checkbox checkbox-primary" required />
                <span className="label-text"> Souhlasím s <a href="/termsOfUse" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">podmínkami použití</a></span>
              </label>
            </div>
            <div className="modal-action">
              <button type="submit" className="btn btn-primary">Registrovat se</button>
              <button type="button" className="btn" onClick={() => document.getElementById('register_modal').close()}>Zavřít</button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
};

export default RegistrationModal;