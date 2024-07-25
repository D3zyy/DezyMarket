import React from 'react';
import RegistrationModal from './RegistrationModal';

const LoginModal = ({ handleLogin }) => {
  return (
    <>
      <button className="btn" onClick={() => document.getElementById('login_modal').showModal()}>Přihlásit se</button>
      <dialog id="login_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Přihlášení</h3>
          <form onSubmit={handleLogin}>
            <div className="py-4">
              <label htmlFor="email" className="block">Email</label>
              <input type="email" id="email" className="input input-bordered w-full" required />
            </div>
            <div className="py-4">
              <label htmlFor="password" className="block">Heslo</label>
              <input type="password" id="password" className="input input-bordered w-full" required />
            </div>
            <div className="modal-action">
              <button type="submit" className="btn btn-primary">Přihlásit se</button>
              <button type="button" className="btn" onClick={() => document.getElementById('login_modal').close()}>Close</button>
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