"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export const openGiftSubModal = () => {
  const modal = document.getElementById(`gift_sub_modal`);
  if (modal) {
    modal.showModal(); // Použijeme showModal() pro dialogové okno
  }
};

export function GiftSubModal({ idOfUser,allSub }) {
    const [idOfSub, SetidOfSub] = useState(false);
    const [nmbMontIn, SetnmbMontIn] = useState(1);
    const [NumberMont, SetNumberMont] = useState(1);
    const router = useRouter();
    useEffect(() => {
      if (allSub.length > 0) {
        SetidOfSub(allSub[0].id); // Nastav první ID v seznamu
      }
    }, [allSub]);
  const giftSubSend = async () => {
    try {
      
      const response = await fetch('/api/giftSub', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idOfUser,
          idOfSub,
          nmbMontIn,
          NumberMont,
        }),
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





  return (
    <dialog
    id={`gift_sub_modal`}
    className="modal bg-slate-950/25 modal-bottom sm:modal-middle"
    data-backdrop="true"
  >
    <div className="modal-box flex flex-col items-center space-y-4">
      {/* Výběr sub */}
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-12">
  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
</svg>

<select
  onChange={(event) => {
    const selectedValue = event.target.value;
    if (selectedValue) {
      SetidOfSub(Number(selectedValue)); // Nastavení pouze při platném čísle
    }
  }}
  className="select select-bordered w-48"
>
  {allSub
    .filter((sub) => sub.priority > 1) // Filtruj podle priority
    .map((sub) => (
      <option key={sub.id} value={sub.id}>
        {sub.name}
      </option>
    ))}
</select>
  
      {/* Vstup pro počet měsíců */}
      <div className="flex flex-col items-center">
        <label
          htmlFor="monthIn"
          className="block text-sm font-medium text-gray-500 text-center"
        >
          Od měsíce(topovaní):
        </label>
        <input
          type="number"
          name="monthIn"
          id="monthIn"
          defaultValue={1}
          className="input input-bordered w-16 text-center" // Malá šířka a zarovnání na střed
          onChange={(e) => SetnmbMontIn(Number(e.target.value))}
        />
      </div>
      <div className="flex flex-col items-center">
        <label
          htmlFor="monthIn"
          className="block text-sm font-medium text-gray-500 text-center"
        >
          Na počet měsíců:
        </label>
        <input
           defaultValue={1}
          type="number"
          name="monthIn"
          id="monthIn"
          className="input input-bordered w-16 text-center" // Malá šířka a zarovnání na střed
          onChange={(e) => SetNumberMont(Number(e.target.value))}
        />
      </div>
  
      {/* Akční tlačítka */}
      <div className="text-center mt-4">
        <button
          type="button"
          className="btn btn-primary"
          onClick={giftSubSend}
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

