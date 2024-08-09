import React from 'react';
import LoginModal from './modals/LoginModal';
import RegistrationModal from './modals/RegistrationModal';
import { openLoginModal } from './modals/LoginModal';
import { openRegisterModal } from './modals/RegistrationModal';
import AddOfferButton from './addOfferButton';

const ProfileNavBarNotLoggedIn = () => {
  return (
    <>
      <div className="hidden sm:flex items-center">
        {/* Přidat inzerát tlačítko */}
        <button
            id="add-offer-btn"
            onClick={openLoginModal}
            onTouchStart={openLoginModal}
            className="btn"
            style={{ margin: "0px 10px" }}
          >
            Přidat inzerát
          </button>

        {/* Čára mezi tlačítky */}
        <div className="border-r-2 border-dotted border-black mx-4 h-8" />

        {/* Přihlásit se tlačítko */}
        <button
          id="login-btn"
          className="btn"
          onClick={openLoginModal}
          onTouchStart={openLoginModal}
          style={{ margin: "0px 10px" }}
        >
          Přihlásit se
        </button>

        {/* Registrace tlačítko */}
        <button
          id="registration-btn"
          className="btn"
          onClick={openRegisterModal}
          onTouchStart={openRegisterModal}
        >
          Registrace
        </button>
      </div>

      <div className="sm:hidden">
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </div>
          <ul className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
          <li> {/* Tlačítko */}
        <button
          id="add-offer-btn"
          onClick={openLoginModal}
          onTouchStart={openLoginModal}
          className="btn block sm:hidden"
          style={{ margin: "10px 0px" }}
        >
          Přidat inzerát
        </button></li>
            <li>
              <button
                onClick={openLoginModal}
                onTouchStart={openLoginModal}
              >
                Přihlásit se
              </button>
            </li>
            <li>
              <button
                onClick={openRegisterModal}
                onTouchStart={openRegisterModal}
              >
                Registrace
              </button>
            </li>
          </ul>
        </div>
      </div>
      
      <LoginModal />
      <RegistrationModal />
    </>
  );
}

export default ProfileNavBarNotLoggedIn;