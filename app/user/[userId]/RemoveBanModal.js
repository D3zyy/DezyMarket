'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
export const openRemoveBanModal = (banId) => {
  const modal = document.getElementById(`ban_remove-modal${banId}`);
  if (modal) {
    modal.showModal(); // Použijeme showModal() pro dialogové okno
  }
};

// DeleteBanModal Component
 function RemoveBanModal({ banIdd }) {
  const [banId, setbanId] = useState(banIdd);
  const router = useRouter()
  const updateBan = async () => {
    try {
      const response = await fetch('/api/updateBan', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(banId),
      });

      const result = await response.json();
      router.refresh()
      closeModal()
    } catch (error) {
      console.error('Error updating ban:', error);
    }
  };

  // Funkce pro zavření modalu
  const closeModal = () => {
    const modal = document.getElementById(`ban_remove-modal${banId}`);
    if (modal) {
      modal.close();
    }
  };

  return (
    <div>
      {/* Tlačítko pro otevření modalu */}
      <button onClick={() => openRemoveBanModal(banId)} className="btn btn-sm">
        Smazat ban
      </button>

      {/* Modal */}
      <dialog
        id={`ban_remove-modal${banId}`}
        className="modal bg-slate-950/25 modal-bottom sm:modal-middle"
        data-backdrop="true"
      >
        <div className="modal-box">
          <span className="block text-center text-lg font-bold mb-4 text-red-500">Smazat ban</span>
          <div>
            {/* Zarovnaný text na střed */}
            <p className="text-gray-500 text-center mb-4 font-semibold text-sm">Opravdu chcete smazat tento ban ze systému?</p>
          </div>

          <div className="text-center">
            <button
              type="button"
              className="btn hover:bg-red-43829 border-red-500  bg-red-500"
              onClick={updateBan}
            >
              Smazat 
            </button>

            <button
              type="button"
              className="btn ml-4"
              onClick={closeModal}
            >
              Zavřít
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}

export default RemoveBanModal;