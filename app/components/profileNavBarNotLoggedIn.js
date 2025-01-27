"use client";

import React, { useState } from "react";
import LoginModal from "./modals/LoginModal";
import RegistrationModal from "./modals/RegistrationModal";
import { openLoginModal } from "./modals/LoginModal";
import { openRegisterModal } from "./modals/RegistrationModal";
import AddOfferButton from "./AddOfferButton";

const ProfileNavBarNotLoggedIn = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleDropdownToggle = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleDropdownClose = (action) => {
    if (action) action(); // Zavolejte odpovídající akci (např. modal otevření)
    setDropdownOpen(false);
  };

  return (
    <>
      <div className="hidden sm:flex items-center">
        {/* Přidat inzerát tlačítko */}
        <AddOfferButton />

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

      {/* Mobilní menu */}
      <div className="sm:hidden">
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle"
            onClick={handleDropdownToggle}
          >
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
          {dropdownOpen && (
            <ul className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
              <li>
                <AddOfferButton />
              </li>
              <li>
                <button
                  style={{ marginTop: "15px" }}
                  onClick={() => handleDropdownClose(openLoginModal)}
                  onTouchStart={() => handleDropdownClose(openLoginModal)}
                >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25" />
</svg>
  Přihlásit se
                </button>
              </li>
              <li className="mt-2">
                <button
                  onClick={() => handleDropdownClose(openRegisterModal)}
                  onTouchStart={() => handleDropdownClose(openRegisterModal)}
                >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
</svg>
   Registrace
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* Modály */}
      <LoginModal />
      <RegistrationModal />
    </>
  );
};

export default ProfileNavBarNotLoggedIn;