'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

function ReNewSubButton({ name, useToId }) {
  const [nameToCancel, setnameToCancel] = useState(name);
  const [usrId, setusrId] = useState(useToId);
  const [loading, setLoading] = useState(false); // Add loading state
  const router = useRouter();
  
  const updateSub = async () => {
    setLoading(true); // Set loading to true when request starts
    try {
      const response = await fetch('/api/reactivate-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: nameToCancel, usrId: usrId }), // Properly structure the body as an object
      });

    
        router.refresh(); // Refresh the page if the request is successful
    
    } catch (error) {
      console.error('Error reactivating subscription:', error);
    } 
  };

  return (
    <button
      type="button"
      className="btn btn-sm"
      onClick={updateSub}
      disabled={loading} // Disable the button when loading
    >
      {loading ? 'Obnovuji předplatné...' : <><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 text-yellow-500">
  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
</svg>
Obnovit předplatné</>} {/* Show loading text while request is in progress */}
    </button>
  );
}

export default ReNewSubButton;