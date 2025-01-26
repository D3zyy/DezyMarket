'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

function DeleteSessionBtn({sessionId }) {
  const [sesId, setSesId] = useState(sessionId);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const deleteSession = async () => {
    setLoading(true); // Set loading to true when request starts
    try {
      const response = await fetch('/api/deleteSession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: sesId }), // Properly structure the body as an object
      });

      
        router.refresh(); // Refresh the page if the request is successful
      
    } catch (error) {
      console.error('Error updating subscription:', error);
    }  finally{
        setLoading(false)
    }
  };

  return (
    <button
      type="button"
      className="btn btn-sm"
      onClick={deleteSession}
      disabled={loading} // Disable the button when loading
    >
      {loading ? 'Ničím session..' : <><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 text-red-500">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg> Zníčit session
 </>} {/* Show loading text while request is in progress */}
    </button>
  );
}

export default DeleteSessionBtn;