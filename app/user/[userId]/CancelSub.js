'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';


// DeleteBanModal Component
 function CancelSubButton({ name , useToId}) {
  const [nameToCancel, setnameToCancel] = useState(name);
  const [usrId, setusrId] = useState(useToId);
  const router = useRouter()
  console.log("ID uživatele:eeee",useToId)
  const updateSub = async () => {
    try {
      const response = await fetch('/api/deactivate-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: nameToCancel, usrId: usrId }), // Properly structure the body as an object
      });
  
      if (response.ok) {
        router.refresh(); // Refresh the page if the request is successful
      } else {
        console.error('Failed to deactivate subscription');
      }
    } catch (error) {
      console.error('Error updating ban:', error);
    }
  };



  return (
  
       

       
            <button
              type="button"
              className="btn btn-sm"
              onClick={updateSub}
            >
              Zrušit  
            </button>

  );
}

export default CancelSubButton;