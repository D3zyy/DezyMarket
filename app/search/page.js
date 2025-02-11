import React from 'react'
import PostsPage from '../components/PostsPage'
import { Suspense } from 'react'
async function page() {
    
try{
    return (
        <Suspense>
           <PostsPage />
           </Suspense>
     
    )
} catch (e) {
    console.error("Chyba při načítání dat:", e);
    return <div className="flex items-center justify-center min-h-screen">Nastala chyba.</div>;
  }
}

export default page
