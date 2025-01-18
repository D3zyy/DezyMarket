'use client';
import React, { useState } from 'react';

export const openDeleteBanModal = (banId) => {
  const modal = document.getElementById(`ban_delete-modal${banId}`);
  if (modal) {
    modal.showModal(); // Použijeme showModal() pro dialogové okno
  }
};

// DeleteBanModal Component
function DeleteBanModal({ banIdd}) {
  const [banId, setbanId] = useState(banIdd);

  const updateBan = async () => {
    try {
      const response = await fetch('/api/updateBan', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(banId),
      });

      const result = await response.json();
    window.location.reload()
 
     
    } catch (error) {
      console.error('Error updating ban:', error);
    }
  };


  // Funkce pro zavření modalu
  const closeModal = () => {
    const modal = document.getElementById(`ban_delete-modal${banId}`);
    if (modal) {
      modal.close();
    }
  };

  return (
    <div>
      {/* Tlačítko pro otevření modalu */}
      <button onClick={() => openDeleteBanModal(banId)} className="btn btn-sm">
        Zrušit ban
      </button>

      {/* Modal */}
      <dialog
        id={`ban_delete-modal${banId}`}
        className="modal bg-slate-950/25 modal-bottom sm:modal-middle"
        data-backdrop="true"
      >
        <div className="modal-box">
          <span className="block text-center text-lg font-bold mb-4">Zrušit ban</span>
          <div>
            {/* Zde můžete přidat obsah pro potvrzení smazání */}
            <p>Opravdu chcete zrušit tento ban?</p>
          </div>

          <div className="text-center"> 
            <button
              type="button"
              className="btn btn-primary"
              onClick={updateBan}
            >
              Zrušit ban
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

export default DeleteBanModal;