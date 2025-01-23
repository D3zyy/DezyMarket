"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// Open Modal function
export const openAddBanModal = () => {
  const modal = document.getElementById('ban_add_modal');
  if (modal) {
    modal.showModal(); // Open the modal
  }
};

const CreateBanModal = ({ userIdd }) => {  // Destructure userId from props
  const [userId, setUserId] = useState(userIdd);
  const [reason, setReason] = useState('');
  const [permanent, setPermanent] = useState(false);
  const [numberOfDays, setNumberOfDays] = useState(null);

  const router = useRouter();

  // Function to close the modal
  const closeModal = () => {
    const modal = document.getElementById('ban_add_modal');
    if (modal) {
      modal.close();  // Close the modal
    }
  };

  const createBan = async (updatedBanData) => {
    try {
      const response = await fetch('/api/createBan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedBanData),
      });

      const result = await response.json();
      window.location.reload();  // Reload the page after successful creation
      console.log('Ban created successfully', result);
    } catch (error) {
      console.error('Error creating ban:', error);
    }
  };

  return (
    <div className='mt-4'>
   

      <dialog
        id="ban_add_modal"  // Correct the id here
        className="modal bg-slate-950/25 modal-bottom sm:modal-middle "
        data-backdrop="true"
      >
        <div className="modal-box">
          <span className="block text-lg text-center font-bold mb-4 ">Přidat ban</span>

          <table className="table table-zebra w-full mb-4">
            <tbody>
              <tr>
                <td><strong>Počet dní:</strong></td>
                <td>2</td>
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
              className="btn mt-2 btn-xs mr-2"
            >
              30 minut
            </button>
            <button
              className="btn mt-2 btn-xs mr-2"
            >
              1 den
            </button>
            <button
              className="btn mt-2 btn-xs mr-2"
            >
              3 dny
            </button>
            <button
              className="btn mt-2 btn-xs mr-2"
            >
              7 dní
            </button>
            <button
              className="btn mt-2 btn-xs mr-2"
            >
              1 měsíc
            </button>
            <button
              className="btn mt-2 btn-xs mr-2"
            >
              1 rok
            </button>
            <button
              className="btn mt-1 btn-xs mr-2"
            >
              Trvalý ban
            </button>
          </div>

          <div className="text-center"> 
            <button
              type="button"
              className="btn btn-primary"
              onClick={createBan}
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
};

export default CreateBanModal;