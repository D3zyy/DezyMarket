"use client";

import React, { useState } from "react";
import LogOutButton from "./LogOutButton";
import AddOfferButton from "./AddOfferButton";
import { useRouter } from "next/navigation";

const ProfileNavBarClient = ({ session }) => {
 // console.log(session)
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const handleDropdownToggle = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleDropdownClose = (action) => {
    if (action) action(); // Volitelně spustí akci
    setDropdownOpen(false);
  };

  if (!session.isLoggedIn) return null;

  return (
    <div className="flex items-center">
      <div className="hidden sm:flex items-center">
        <AddOfferButton />
        {/* Čára mezi tlačítky */}
        <div className="border-r-2 border-dotted border-black mx-4 h-8" />
      </div>
      {/* Profilový obrázek s dropdown menu */}
      <div className="dropdown dropdown-end">
        <div
          tabIndex={0}
          role="button"
          className="btn btn-ghost btn-circle avatar"
          onClick={handleDropdownToggle}
        >
        

        <div
        className={`w-10 rounded-full ${
          session?.role?.privileges === 2 
            ? "border border-red-500" 
            : session?.role?.privileges === 3 
            ? "border border-yellow-500" 
            : session?.role?.privileges === 4 
            ? "border border-green-500"
            : "" // případ, kdy žádná podmínka není splněna
        }`}
      >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-35"
            >
              <path
                fillRule="evenodd"
                d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        {dropdownOpen && (
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            <li className="sm:hidden">
              {/* Zavřít dropdown při kliknutí na AddOfferButton */}
              <AddOfferButton onClick={() => handleDropdownClose()} />
            </li>
            
            <li>
               <a
              className="mt-2 justify-between"
              onClick={() => {
                handleDropdownClose();
                router.push("/posts");
              }}
             >
                Moje príspěvky
                <span className="badge">New</span>
              </a>
            </li>
            <li>
            <a onClick={() => { handleDropdownClose(); router.push(`/user/${session.userId}`); }}>Profil</a>
            </li>

            <li>
              <a onClick={() => {handleDropdownClose();  router.push("/settings");}}>Nastavení</a>
            </li>
           

            <li>
              <LogOutButton
                onClick={() => handleDropdownClose(() => console.log("Logout"))}
              />
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProfileNavBarClient;