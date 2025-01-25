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
      {loading ? 'Obnovuji předplatné...' : 'Obnovit předplatné'} {/* Show loading text while request is in progress */}
    </button>
  );
}

export default ReNewSubButton;