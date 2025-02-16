"use client";

import React, { useState } from "react";
import LogOutButton from "./LogOutButton";
import AddOfferButton from "./AddOfferButton";
import { useRouter } from "next/navigation";
import {CardsModal, openCardsModal} from "./modals/SavedCardsModal";

const ProfileNavBarClient = ({ session }) => {

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
            : session?.accPriority === 2 ?
            "border border-orange-500":
            session?.accPriority === 3 ?
            "border border-purple-500":
            ""
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
          <>
          <div
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 "
          >
            <li className="sm:hidden">
              {/* Zavřít dropdown při kliknutí na AddOfferButton */}
              <AddOfferButton onClick={() => handleDropdownClose()} />
            </li>
            
            <li>
               <a
              className="mt-2 "
              onClick={() => {
                handleDropdownClose();
                router.push(`/user/${session.userId}#PostsOfUser`);
              }}
             >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
</svg>
   Moje příspěvky
                
              </a>
            </li>
            <li className="mt-2">
            <a onClick={() => { handleDropdownClose(); router.push(`/user/${session.userId}`); }}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
</svg>
 Můj profil</a>
            </li>
            <li>
            <a
              className="mt-2  text-purple-500"
              onClick={() => {
                handleDropdownClose();
                router.push(`/typeOfAccount`);
              }}
             >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
</svg>
Moje předplatné
</a>
            </li>
            {session.role.privileges > 1 &&
            <li>
               <a
              className="mt-2  text-red-500"
              onClick={() => {
                handleDropdownClose();
                router.push(`/admin`);
              }}
             >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-red-500">
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
</svg>
    Admin menu
                
              </a>
              
            </li>
            
            
           
           
}





            <li className="mt-1">
              
              <LogOutButton
                onClick={() => handleDropdownClose(() => console.log("Logout"))}
              />
            </li>
           
           <div>
            
           </div>
          </div>
  </>
        )}
      </div>
      
    
    </div>
  );
};

export default ProfileNavBarClient;