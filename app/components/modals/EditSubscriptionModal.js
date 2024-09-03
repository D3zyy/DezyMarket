"use client";

export function openEditSubscriptionModal() {
  document.getElementById('edit_modal').showModal();
}

export const EditSubscriptionModal = ({ cancel, date }) => {
  return (
    <dialog id="edit_modal" className="modal modal-bottom sm:modal-middle">
      <div className="modal-box w-full max-w-lg p-6 flex flex-col items-center">
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
                  Výhody předplatného zůstanou aktivní pouze do  {date}
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
            className={`${
              cancel ? 'text-green-500' : 'text-red-400'
            } btn mt-6`}
          >
            {cancel ? 'Obnovit předplatné' : 'Deaktivovat předplatné'}
          </button>
        </div>
      </div>
    </dialog>
  );
};