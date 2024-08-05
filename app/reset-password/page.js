"use client";
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

async function fetchVerification(token, newPassword) {
  try {
    const res = await fetch('/api/email/recovery/validateToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, newPassword })
    });

    const response = await res.json();

    return response;
  } catch (error) {
    console.error('Nastala chyba při změně hesla:', error);
    return { message: 'Chyba při změně hesla.', success: false };
  }
}

const Page = () => {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(true); // Modal should be shown by default
  
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      router.push('/'); // Redirect to home if token is missing
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Hesla se neshodují.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await fetchVerification(token, newPassword);

    if (result.success) {
      setSuccess('Heslo bylo úspěšně změněno.');
    } else {
      setError(result.message || 'Nastala chyba při obnově hesla.');
    }

    setLoading(false);
  };

  return (
    <>
      <dialog open={showModal} id="recovery_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          {error && <div className="flex items-center space-x-10 p-1"  style={{ color: 'red', marginBottom: '10px' }}><XCircleIcon className="h-6 w-6 text-red-500"  style={{marginRight: "5px"}}/>{error}</div>}
          {success && <div className="flex items-center space-x-10 p-1" style={{ color: 'green', marginBottom: '10px' }}><CheckCircleIcon className="h-6 w-6 text-green-500" style={{marginRight: "5px"}}/> {success}</div>}
          <h3 className="font-bold text-lg">Obnovení hesla</h3>
          <form onSubmit={handleSubmit}>
            <div className="py-4">
              <label htmlFor="newPassword" className="block">Nové heslo</label>
              <input
                type="password"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </div>
            <div className="py-4">
              <label htmlFor="confirmPassword" className="block">Potvrzení nového hesla</label>
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </div>
            <div className="modal-action">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Načítání...' : 'Obnovit heslo'}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setShowModal(false)}
              >
                Zavřít
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
};

export default Page;