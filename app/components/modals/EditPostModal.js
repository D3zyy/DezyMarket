"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

async function updatedPost(name) {
  try {
    const response = await fetch('/api/posts', {
      method: 'PUT',
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



export function openEditPostModal() {
  document.getElementById('edit_post_modal').showModal();
}

export function closeEditPostModal() {
  document.getElementById('edit_post_modal').close();
}

export const EditPostModal = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false); // State for loading indicator

  const handlePostChange = async () => {
    setLoading(true); // Start loading
    updatedPost()
    location.reload(); 
  
  };

  return (
    <dialog id="edit_post_modal" className="modal modal-bottom sm:modal-middle" style={{ marginLeft: "0px" }}>
      <div className="modal-box w-full p-6 flex flex-col items-center">
        <div className="text-center">
          { 
            <>
              <h1 className="text-green-400 text-2xl font-bold mb-4">
                Název
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
                  Předplatné se znovu obnoví 

                </li>
              </ul>
            </>
         }

          <button
            onClick={handlePostChange}
            className={"btn btn-primary"}
            disabled={loading} // Disable button while loading
          >
            {loading ? 'Načítání...' : "Uložit"}
          </button>
          <button
            onClick={closeEditPostModal}
            onTouchStart={closeEditPostModal}
            className='btn'
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