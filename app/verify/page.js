"use client";
import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

async function fetchVerification(email, token) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify?token=${token}&email=${email}`
    );

   

    return await res.json();
  } catch (error) {
    console.error('Error fetching verification:', error);
    return { message: '', success: false };
  }
}

const Page = ({ searchParams }) => {
  const { token, email } = searchParams;
  const [showModal, setShowModal] = useState(true); 
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      if (!token || !email) {
        setMessage('Žádné parametry nebyly načteny');
        setIsSuccess(false);
        setLoading(false);
        return;
      }

      const result = await fetchVerification(email, token);
      console.log(result.message)
      setMessage(result.message || 'An error occurred or verification is not valid.');
      setIsSuccess(result.success);
      setLoading(false);
    };

    verify();
  }, [token, email]);

  return (
    <>
      <dialog open={showModal} id="recovery_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <div className="modal-action">
          <div className="flex items-center justify-center h-32 w-full p-4">
              {loading ? (
                <div className="grid place-items-center h-full w-full">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : (
                <>
                  {token && email ? (
                    isSuccess ? (
                      <>
                        <CheckCircleIcon className="h-6 w-6 text-green-500" />
                        <span>{message}</span>
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="h-6 w-6 text-red-500" />
                        <span>{message}</span>
                      </>
                    )
                  ) : (
                    <>
                      <XCircleIcon className="h-6 w-6 text-red-500" />
                      <span>{message}</span>
                    </>
                  )}
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setShowModal(false)}
                  >
                    Zavřít
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default Page;