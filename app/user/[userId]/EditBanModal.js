'use client';
import React, { useState, useEffect } from 'react';

export const openUpdateBanModal = (banId) => {
  const modal = document.getElementById(`ban_update-modal-${banId}`);
  if (modal) {
    modal.showModal(); // Použijeme showModal() pro dialogové okno
  }
};

// UpdateBanModal Component
function UpdateBanModal({ banIdd, bannedFromm, bannedToo, reasonn, pernamentt }) {
  const [banId, setbanId] = useState(banIdd);
  const [bannedFrom, setBannedFrom] = useState(bannedFromm);
  const [bannedTo, setBannedTo] = useState(bannedToo);
  const [reason, setReason] = useState(reasonn);
  const [pernament, setPernament] = useState(pernamentt);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [isClient, setIsClient] = useState(false); // Flag to detect when the component is mounted on the client


  const calculateDaysDifference = (startDate, endDate) => {
    if (startDate && endDate) {
      // Získání časových hodnot bez hodin, minut a sekund (aby se zabránilo nechtěnému navýšení)
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      const end = new Date(endDate).setHours(0, 0, 0, 0);
  
      const diffTime = end - start; // Rozdíl v milisekundách
      const diffDays = diffTime / (1000 * 3600 * 24); // Převod na dny
      return Math.floor(diffDays); // Vrátí celé číslo dnů
    }
    return 0; // Pokud nejsou data, vrátí 0
  };


  useEffect(() => {
    setIsClient(true); // Set to true after the component has mounted on the client
  }, []);

  // Funkce pro zavření modalu
  const closeModal = () => {
    const modal = document.getElementById(`ban_update-modal-${banId}`);
    if (modal) {
      modal.close();
    }
  };

  // Funkce pro změnu vybrané doby trvání banu
  const handleDurationClick = (duration) => {
    setSelectedDuration(duration);
  };

  // Funkce pro uložení změn
  const handleSave = () => {
    const newBannedTo = new Date();
    switch (selectedDuration) {
      case '3days':
        newBannedTo.setDate(newBannedTo.getDate() + 3);
        break;
      case '7days':
        newBannedTo.setDate(newBannedTo.getDate() + 7);
        break;
      case '1month':
        newBannedTo.setMonth(newBannedTo.getMonth() + 1);
        break;
      case '1year':
        newBannedTo.setFullYear(newBannedTo.getFullYear() + 1);
        break;
      case 'permanent':
        newBannedTo.setFullYear(newBannedTo.getFullYear() + 100); // Trvalý ban
        break;
      default:
        return;
    }
    setBannedTo(newBannedTo);
    closeModal();
  };

  // Převeď data na řetězec, používat stejné formátování na serveru i klientovi
  const formatDate = (date) => {
    if (date instanceof Date) {
      return date.toLocaleString('cs-CZ'); // Používáme konstantní formát (např. český formát)
    }
    return date; // Pokud není objekt typu Date, vrátí původní hodnotu
  };

  if (!isClient) {
    // Renderujeme pouze po montování komponenty na klientovi
    return null;
  }

  return (
    <div>
      {/* Tlačítko pro otevření modalu */}
      <button onClick={() => openUpdateBanModal(banId)} className="btn btn-sm">
        Upravit ban
      </button>

      {/* Modal */}
      <dialog
        id={`ban_update-modal-${banId}`}
        className="modal bg-slate-950/25 modal-bottom sm:modal-middle"
        data-backdrop="true"
      >
        <div className="modal-box">
          <span className="block text-lg text-center font-bold mb-4">Upravit ban</span>

          {/* Tabulka pro zobrazení informací */}
          <table className="table table-zebra w-full mb-4">
            <tbody>
              <tr>
                <td><strong>Počet dní:</strong></td>
                <td>{calculateDaysDifference(bannedFrom, bannedTo)}</td>
              </tr>
              <tr>
                <td><strong>Banováno od:</strong></td>
                <td>{formatDate(bannedFrom)}</td>
              </tr>
              <tr>
                <td><strong>Banováno do:</strong></td>
                <td>{formatDate(bannedTo)}</td>
              </tr>
              <tr>
                <td><strong>Důvod:</strong></td>
                <td>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    style={{ height: '150px', resize: 'none' }} // Zvýšení výšky a zakázání resize
                    placeholder="Bio"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </td>
              </tr>
            </tbody>
          </table>

          {/* Tlačítka pro výběr doby trvání */}
          <div className="mb-4">
            <button
              className={`btn btn-xs mr-2 ${selectedDuration === '3days' ? 'btn-primary' : ''}`}
              onClick={() => handleDurationClick('3days')}
            >
              3 dny
            </button>
            <button
              className={`btn btn-xs mr-2 ${selectedDuration === '7days' ? 'btn-primary' : ''}`}
              onClick={() => handleDurationClick('7days')}
            >
              7 dní
            </button>
            <button
              className={`btn btn-xs mr-2 ${selectedDuration === '1month' ? 'btn-primary' : ''}`}
              onClick={() => handleDurationClick('1month')}
            >
              1 měsíc
            </button>
            <button
              className={`btn btn-xs mr-2 ${selectedDuration === '1year' ? 'btn-primary' : ''}`}
              onClick={() => handleDurationClick('1year')}
            >
              1 rok
            </button>
            <button
              className={`btn btn-xs mr-2 ${selectedDuration === 'permanent' ? 'btn-primary' : ''}`}
              onClick={() => handleDurationClick('permanent')}
            >
              Trvalý ban
            </button>
          </div>

          {/* Tlačítko pro uložení změn */}
          <div className='text-center'> 
          <button
            type="button"
            className="btn  btn-primary"
            onClick={handleSave}
          >
            Uložit změny
          </button>

          {/* Tlačítko pro zavření */}
          <button
            type="button"
            className="btn ml-4"
            onClick={closeModal}
            onTouchStart={closeModal}
          >
            Zavřít
          </button>
          </div>
         
        </div>
      </dialog>
    </div>
  );
}

export default UpdateBanModal;