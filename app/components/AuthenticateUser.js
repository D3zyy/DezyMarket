'use client';

import LoginModal from './modals/LoginModal';
import RegistrationModal from './modals/RegistrationModal';
import { useState, useEffect } from 'react';
import { logOut } from '../authentication/actions';
import ProfileNavBar from './profileNavBar';

 
const AuthenticateUser =  () => {

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


    const fetchSession = async () => {
      try {
        const res = await fetch('/api/session');
        if (res.ok) {
          const data = await res.json();
          setSession(data);
          
        } else {
          // Handle non-OK responses
          console.error("Failed to fetch session:", res.statusText);
          setError(`Error: ${res.statusText}`);
        }
      } catch (err) {
        // Handle network errors or other exceptions
        console.error("An error occurred while fetching session:", err);
        setError("An error occurred while fetching session.");
      } finally {
        setLoading(false);
      }
    };


  useEffect(() => {
   
    fetchSession();
    
  }, []); 
 
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  

  const handleLogout = () => {
    
  };



  const handleRegister = (event) => {
    
  };


  function openLoginModal() {
    document.getElementById('login_modal').showModal();
  }

  function openRegisterModal() {
    document.getElementById('register_modal').showModal();
  }

  return (
    <div>
      {session.isLoggedIn ? (
        <ProfileNavBar />
      ) : (
        <>
          <div className="hidden sm:flex">
            <button
              id="login-btn"
              className="btn"
              onClick={openLoginModal}
              onTouchStart={openLoginModal}
              style={{margin: "0px 10px"}}
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
          <LoginModal />
          <RegistrationModal handleRegister={handleRegister} />
        </>
      )}
    </div>
  );
};

export default AuthenticateUser;