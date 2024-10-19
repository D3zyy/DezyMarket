'use client';

import { useState } from 'react';
import InfoModal from './modals/InfoModal';
import { openInfoModal } from './modals/InfoModal';

export default function NotLoggedInButton() {
  return (
    <div className="absolute inset-0 flex items-center ">
      <div className="  flex justify-center "> {/* Dashed circular border */}
        <button
          className="btn w-15 h-4   flex items-center rounded-md transition-transform transform hover:scale-105"
          onClick={() => openInfoModal()}
        >
         <span>Zobrazit</span>🔎
        </button>
      </div>

      {/* Zobrazí komponentu NotLoggedIn, když bylo tlačítko kliknuto */}
      <InfoModal defaultOpen={false} message="Pro zobrazení se přihlaste" backToHome={false} />
    </div>
  );
}