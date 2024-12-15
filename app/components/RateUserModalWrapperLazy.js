"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { openRateUserModal } from "@/app/components/modals/RateUserModal";

// Dynamicky načtený komponent bez SSR
const RateUserModal = dynamic(
  () => import("@/app/components/modals/RateUserModal"),
  { ssr: false }
);

export const RatePostModalWrapperLazy = ({ userToRate,nameOfUser }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [hasError, setHasError] = useState(false); // Stav pro detekci chyby

  const handleOpenModal = () => {
    try {
      setIsModalVisible(true);
      if (!isModalVisible) {
       
        setTimeout(() => {
            openRateUserModal();
        }, 1000);
      } else {

        openRateUserModal();
      }
    } catch (error) {
      setHasError(true); // Pokud dojde k chybě, nastavíme stav na true
      console.error("Chyba otevírání modalu:", error);
    }
  };

  return (
    <div>
      <a
        className="btn  sm:h-0 h-20   flex-shrink "
        onClick={handleOpenModal}
      >
        {hasError ? (
          <span>Nastala chyba</span> // Zobrazí se text místo ikony
        ) : (
          <>
         <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6 text-yellow-600"
            >
            <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
            />
            </svg>
            Ohodnotit uživatele
          </>
        )}
      </a>

      {isModalVisible && <RateUserModal userToRate={userToRate} nameOfUser={nameOfUser} />}
    </div>
  );
};