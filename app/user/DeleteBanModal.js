'use client';
import React, { useState } from 'react';

export const openDeleteBanModal = (banId) => {
  const modal = document.getElementById(`ban_delete-modal${banId}`);
  if (modal) {
    modal.showModal(); // Použijeme showModal() pro dialogové okno
  }
};

// DeleteBanModal Component
function DeleteBanModal({ banIdd, bannedFromm, bannedToo, reasonn, pernamentt }) {
  const [banId, setbanId] = useState(banIdd);
  const [bannedFrom, setBannedFrom] = useState(bannedFromm);
  const [bannedTo, setBannedTo] = useState(bannedToo);
  const [reason, setReason] = useState(reasonn);
  const [pernament, setPernament] = useState(pernamentt);

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

          <button
            type="button"
            className="btn"
            onClick={closeModal}
            onTouchStart={closeModal}
          >
            Zavřít
          </button>
        </div>
      </dialog>
    </div>
  );
}

export default DeleteBanModal;