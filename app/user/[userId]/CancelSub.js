'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

function CancelSubButton({pri, gifted, name, useToId }) {
  const [nameToCancel, setnameToCancel] = useState(name);
  const [usrId, setusrId] = useState(useToId);
  const [loading, setLoading] = useState(false); // Add loading state
  const router = useRouter();

  const updateSub = async () => {
    setLoading(true); // Set loading to true when request starts
    try {
      const response = await fetch('/api/deactivate-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: nameToCancel, usrId: usrId, gifted: gifted }), // Properly structure the body as an object
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
      onClick={updateSub}
      disabled={loading || pri <= 1 || pri == null} // Disable the button when loading
    >
      {loading ? 'Ruším...' : 'Zrušit'} {/* Show loading text while request is in progress */}
    </button>
  );
}

export default CancelSubButton;