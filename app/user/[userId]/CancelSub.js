'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';


// DeleteBanModal Component
 function CancelSubButton({gifted, name , useToId}) {
  const [nameToCancel, setnameToCancel] = useState(name);
  const [usrId, setusrId] = useState(useToId);
  console.log("Je giftnutý:",gifted)
  const router = useRouter()
  console.log("ID uživatele:eeee",useToId)
  const updateSub = async () => {
    try {
      const response = await fetch('/api/deactivate-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: nameToCancel, usrId: usrId,gifted: gifted }), // Properly structure the body as an object
      });
  
     
        router.refresh(); // Refresh the page if the request is successful
     
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