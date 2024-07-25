'use client';
import { useState, useEffect } from 'react';
import LoginModal from './/modals/LoginModal';
import RegisterModal from './/modals/RegistrationModal';

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
    // V této ukázce jen zavřeme modal
    document.getElementById('register_modal').close();
  };

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
          <LoginModal handleLogin={handleLogin} />
          <RegisterModal handleRegister={handleRegister} />
        </>
      )}
    </div>
  );
};

export default AuthenticateUser;