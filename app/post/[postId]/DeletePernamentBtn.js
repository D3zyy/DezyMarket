'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';



function DeletePernamentBtn({postId}) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const deletePost = async () => {
        setLoading(true); // Nastavení loading stavu na true
        try {
          const response = await fetch('/api/posts', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                postId: postId,
                pernament: true, // Additional data
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
   
  <button disabled={loading} onClick={deletePost} className="btn border-dotted border-red-600 border-2 flex-shrink hover:border-red-600 ">{loading ? 'Mažu trvale.. ': 'Smazat trvale'} <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-red-500">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg></button>
  )
}

export default DeletePernamentBtn