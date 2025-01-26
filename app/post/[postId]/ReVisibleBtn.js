'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

function ReVisibleBtn({postId}) {
     const [loading, setLoading] = useState(false);
    const router = useRouter();
    const reVisisible = async () => {
        setLoading(true); // Nastavení loading stavu na true
        try {
          const response = await fetch('/api/revisiblePost', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                postId
            }),
          });
    
          const result = await response.json();
          router.refresh();

        } catch (error) {
          console.error('Error updating ban:', error);
        } finally {
            setLoading(false); // Po dokončení nebo chybě, nastavíme loading na false
        }
      };
  return (
<button disabled={loading} onClick={reVisisible} className="btn border-dotted border-orange-600 border-2 flex-shrink hover:border-orange-600 ">{loading ? 'Obnovuji příspěvek.. ': 'Obnovit příspěvek'}   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-orange-500">
  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
</svg></button>
  )
}

export default ReVisibleBtn