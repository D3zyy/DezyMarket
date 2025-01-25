"use client"
import React from 'react';
import { useRouter } from 'next/navigation';


export const openGiftSubModal = () => {
  const modal = document.getElementById(`gift_sub_modal`);
  if (modal) {
    modal.showModal(); // Použijeme showModal() pro dialogové okno
  }
};

export function GiftSubModal({ idOfUser,allSub }) {
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
  const closeModal = () => {
    const modal = document.getElementById(`gift_sub_modal`);
    if (modal) {
      modal.close();
    }
  };

  const router = useRouter();
    console.log("subs:",allSub)
  async function giftSub(subId) {
    try {
      const res = await fetch('/api/giftSub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subId,idOfUser }),
      });

      router.refresh();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <dialog
    id={`gift_sub_modal`}
    className="modal bg-slate-950/25 modal-bottom sm:modal-middle"
    data-backdrop="true"
  >
    <div className="modal-box">
    <select
      onChange={(event) => giftSub(Number(event.target.value))}
      className="select select-bordered w-full max-w-32"
      
    >
     {allSub.map((sub) => (
        <option key={sub.id} value={sub.id}>
          {sub.name} 
        </option>
      ))}
    </select>
    <div className="text-center">
            <button
              type="button"
              className="btn hover:bg-red-600 border-red-500  bg-red-500"
              onClick={updateBan}
            >
              Darovat 
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
 
  );
}

