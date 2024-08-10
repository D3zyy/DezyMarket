import React from 'react';
import LogOutButton from './LogOutButton';
import AddOfferButton from './AddOfferButton';
const  ProfileNavBar = async () => {
  const session = await getSession();

  return (
    <>
    {session.isLoggedIn ? (
        <div className="flex items-center">
        <div className="hidden sm:flex items-center">
        <AddOfferButton />
         {/* Čára mezi tlačítky */}
         <div className="border-r-2 border-dotted border-black mx-4 h-8" />

        </div>
        {/* Profilový obrázek s dropdown menu */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full">
              <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"alt="User avatar" />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
             <li className=" sm:hidden"> {/* This ensures it's only visible on mobile */}
              <AddOfferButton />
            </li>
            <li>
              <a  style={{marginTop : "10px"}} className="justify-between">
                Profil 
                <span className="badge">New</span>
              </a>
            </li>
            
            <li><a>Nastavení</a></li>
            <LogOutButton />

          </ul>
        </div>
      </div>
      ) : (
       <> </>
      )}
      
      </>
  );
}

export default ProfileNavBar;