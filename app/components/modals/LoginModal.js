import React from 'react';

const LoginModal = ({ handleLogin }) => {
  return (
    <>
      
      <dialog id="login_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Přihlášení</h3>
          <form onSubmit={handleLogin}>
            <div className="py-4">
              <label htmlFor="email" className="block">Email</label>
              <input type="email"  className="input input-bordered w-full email" required />
            </div>  
            <div className="py-4">
              <label htmlFor="password" className="block">Heslo</label>
              <input type="password" className="input input-bordered w-full password" required />
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