'use client';
import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon'; // Nezapomeňte importovat Luxon
import { useRouter } from 'next/navigation';
export const openUpdateBanModal = (banId) => {
  const modal = document.getElementById(`ban_update-modal-${banId}`);
  if (modal) {
    modal.showModal(); // Použijeme showModal() pro dialogové okno
  }
};

const formatDate = (date) => {
  // Pokud je ban trvalý
  if (date === 'permanent') {
    return 'Trvale';
  }

  // Pokud je datum typu Date, převedeme ho na řetězec ve formátu ISO
  if (date instanceof Date) {
    date = date.toISOString(); // Převod na ISO řetězec
  }

  // Ověříme, že máme platný řetězec
  if (typeof date === 'string' && date.includes('T')) {
    const [datePart, timePart] = date.split('T');
    const [year, month, day] = datePart.split('-');
    const [hours, minutes] = timePart.split(':');

    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }

  return date; // Pokud to není platné datum, vrátíme původní hodnotu
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
  const [newBannedTo, setNewBannedTo] = useState(bannedToo); // New bannedTo for the updated date
  const router = useRouter()
  function calculateDaysDifference(fromDate, toDate) {
    const dateFrom = new Date(fromDate);
    const dateTo = new Date(toDate);
    const timeDifference = dateTo - dateFrom; // rozdíl v milisekundách
    let daysDifference = timeDifference / (1000 * 3600 * 24); // převod na dny
    if (daysDifference < 1) {
      daysDifference = 0;
    } else {
      daysDifference = Math.ceil(daysDifference); // zaokrouhlení směrem dolů
    }
    return daysDifference;
  }



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

  // Funkce pro uložení změn a výpočet nového data
  const handleSave = () => {
  
    let newDate = DateTime.fromISO(new Date(bannedFromm).toISOString(), { zone: 'utc' });

  
    // Kontrola, zda je něco nastaveno v selectedDuration
 
      // Vytvoření nového data na základě vybrané doby
      switch (selectedDuration) {
        case '30minutes':
          newDate = newDate.plus({ minutes: 30 });
          break;
        case '1day':
          newDate = newDate.plus({ days: 1 });
          break;
        case '3days':
          newDate = newDate.plus({ days: 3 });
          break;
        case '7days':
          newDate = newDate.plus({ days: 7 });
          break;
        case '1month':
          newDate = newDate.plus({ months: 1 });
          break;
        case '1year':
          newDate = newDate.plus({ years: 1 });
          break;
        case 'permanent':
          newDate = newDate.plus({ years: 100 }); // Permanent ban
          break;
        default:
          break;
      }
  
  
  
    
    // Nastavení nového data
    if( selectedDuration){

 
    setNewBannedTo(newDate.toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'"));
    setBannedTo(newDate.toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'"));
  }
    closeModal();
  
    // Zpráva o změnách
    const updatedBanData = {
      banId,
      bannedFrom,
      bannedTo: selectedDuration? newDate.toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'") : bannedToo,
      reason,
      isPermanent: selectedDuration === 'permanent' // Určujeme, zda jde o trvalý ban
    };
  

    // API volání (nebo funkce pro aktualizaci banu)
    updateBan(updatedBanData);
  };

  const updateBan = async (updatedBanData) => {

    try {
      const response = await fetch('/api/updateBan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedBanData),
      });
     
      const result = await response.json();
    window.location.reload()
 
      console.log('Ban updated successfully', result);
    } catch (error) {
      
      console.error('Error updating ban:', error);
    }
  };

 

  return (
    <div>
      <button onClick={() => openUpdateBanModal(banId)} className="btn btn-sm">
        Upravit ban
      </button>

      <dialog
        id={`ban_update-modal-${banId}`}
        className="modal bg-slate-950/25 modal-bottom sm:modal-middle"
        data-backdrop="true"
      >
        <div className="modal-box">
          <span className="block text-lg text-center font-bold mb-4">Upravit ban</span>

          <table className="table table-zebra w-full mb-4">
            <tbody>
              <tr>
                <td><strong>Počet dní:</strong></td>
                <td>{pernament? 'pernametně': calculateDaysDifference(bannedFrom, bannedTo)}</td>
              </tr>
              <tr>
                <td><strong>Banováno od:</strong></td>
                <td>{formatDate(bannedFrom)}</td>
              </tr>
              <tr>
                <td><strong>Banováno do:</strong></td>
                <td>
                  {formatDate(newBannedTo)}
                </td>
              </tr>
              <tr>
                <td><strong>Důvod:</strong></td>
                <td>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    style={{ height: '150px', resize: 'none' }}
                    placeholder="Důvod"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mb-6 ">
            <button
              className={`btn mt-2 btn-xs mr-2 ${selectedDuration === '30minutes' ? 'btn-primary' : ''}`}
              onClick={() => handleDurationClick('30minutes')}
            >
              30 minut
            </button>
            <button
              className={`btn mt-2 btn-xs mr-2 ${selectedDuration === '1day' ? 'btn-primary' : ''}`}
              onClick={() => handleDurationClick('1day')}
            >
              1 den
            </button>
            <button
              className={`btn mt-2 btn-xs mr-2 ${selectedDuration === '3days' ? 'btn-primary' : ''}`}
              onClick={() => handleDurationClick('3days')}
            >
              3 dny
            </button>
            <button
              className={`btn mt-2 btn-xs mr-2 ${selectedDuration === '7days' ? 'btn-primary' : ''}`}
              onClick={() => handleDurationClick('7days')}
            >
              7 dní
            </button>
            <button
              className={`btn mt-2 btn-xs mr-2 ${selectedDuration === '1month' ? 'btn-primary' : ''}`}
              onClick={() => handleDurationClick('1month')}
            >
              1 měsíc
            </button>
            <button
              className={`btn mt-2 btn-xs mr-2 ${selectedDuration === '1year' ? 'btn-primary' : ''}`}
              onClick={() => handleDurationClick('1year')}
            >
              1 rok
            </button>
            <button
              className={`btn mt-1 btn-xs mr-2 ${selectedDuration === 'permanent' ? 'btn-primary' : ''}`}
              onClick={() => handleDurationClick('permanent')}
            >
              Trvalý ban
            </button>
          </div>

          <div className="text-center"> 
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
            >
              Uložit změny
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

export default UpdateBanModal;