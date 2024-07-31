'use client';
import { useState, useEffect } from 'react';
import LoginModal from './modals/LoginModal';
import RegistrationModal from './modals/RegistrationModal';

const AuthenticateUser = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    setIsAuthenticated(!!user);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  const handleLogin = (event) => {
    event.preventDefault();
    // Příklad přihlášení, zde můžete nahradit skutečnou přihlašovací logikou
    localStorage.setItem('user', 'true');
    setIsAuthenticated(true);
    document.getElementById('login_modal').close();
  };

  const handleRegister = (event) => {
    event.preventDefault();
    // Příklad registrace, zde můžete nahradit skutečnou registrační logikou
    document.getElementById('register_modal').close();
  };

  // Funkce pro otevření modálních oken
  function openLoginModal() {
    document.getElementById('login_modal').showModal();
  }

  function openRegisterModal() {
    document.getElementById('register_modal').showModal();
  }

  return (
    <div>
      {isAuthenticated ? (
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full">
              <img
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                alt="User avatar"
              />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
            <li>
              <a className="justify-between">
                Profile
                <span className="badge">New</span>
              </a>
            </li>
            <li><a>Settings</a></li>
            <li><button onClick={handleLogout}>Logout</button></li>
          </ul>
        </div>
      ) : (
        <>
          <div className="hidden sm:flex">
            <button
              id="login-btn"
              className="btn"
              onClick={openLoginModal}
              onTouchStart={openLoginModal}
            >
              Přihlásit se
            </button>
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
          <LoginModal handleLogin={handleLogin} />
          <RegistrationModal handleRegister={handleRegister} />
        </>
      )}
    </div>
  );
};

export default AuthenticateUser;