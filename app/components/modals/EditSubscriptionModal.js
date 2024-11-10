"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

async function deactivateSubscription(name) {
  try {
    const response = await fetch('/api/deactivate-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: name }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
   
  } catch (error) {
    console.error('Error:', error);
  }
}

async function reactivateSubscription(name) {
  try {
    const response = await fetch('/api/reactivate-subscription', { // Assuming a different endpoint for reactivation
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: name }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }


  } catch (error) {
    console.error('Error:', error);
  }
}

export function openEditSubscriptionModal() {
  document.getElementById('edit_modal').showModal();
}

export function closeEditSubscriptionModal() {
  document.getElementById('edit_modal').close();
}

export const EditSubscriptionModal = ({ cancel, date, name }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false); // State for loading indicator

  const handleSubscriptionChange = async () => {
    setLoading(true); // Start loading
    if (cancel) {
      await reactivateSubscription(name);
    } else {
      await deactivateSubscription(name);
    }
    location.reload(); 
  
  };

  return (
    <dialog id="edit_modal" className="modal modal-bottom sm:modal-middle" style={{ marginLeft: "0px" }}>
      <div className="modal-box w-full p-6 flex flex-col items-center">
        <div className="text-center">
          {cancel ? (
            <>
              <h1 className="text-green-400 text-2xl font-bold mb-4">
                Obnovit předplatné
              </h1>
              <ul className="list-disc list-inside text-left">
                <li className="flex items-center mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="green"
                    className="size-6 mr-2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Výhody předplatného zůstanou aktivní
                </li>
                <li className="flex items-center mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="green"
                    className="size-6 mr-2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Předplatné se znovu obnoví {date}
                </li>
              </ul>
            </>
          ) : (
            <>
              <h1 className="text-red-400 text-2xl font-bold mb-4">
                Zrušit předplatné
              </h1>
              <ul className="list-disc list-inside text-left">
                <li className="flex items-center mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="red"
                    className="size-6 mr-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                  Výhody předplatného zůstanou aktivní do {date}
                </li>
                <li className="flex items-center mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="red"
                    className="size-6 mr-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                  Předplatné se již nebude znovu obnovovat
                </li>
              </ul>
            </>
          )}

          <button
            onClick={handleSubscriptionChange}
            className={`${
              cancel ? 'text-green-500' : 'text-red-400'
            } btn mt-6`}
            disabled={loading} // Disable button while loading
          >
            {loading ? 'Načítání...' : (cancel ? 'Obnovit předplatné' : 'Deaktivovat předplatné')}
          </button>
          <button
            onClick={closeEditSubscriptionModal}
            onTouchStart={closeEditSubscriptionModal}
            className='btn'
            autoFocus
            style={{ marginLeft: "15px" }}
            disabled={loading} // Disable close button while loading
          >
            Zavřít
          </button>
        </div>
      </div>
    </dialog>
  );
};