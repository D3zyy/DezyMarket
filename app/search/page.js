import React from 'react'
import PostsPage from '../components/PostsPage'
import { Suspense } from 'react'
async function page() {
    

    return (
        <Suspense>
           <PostsPage />
           </Suspense>
     
    )
}

export default page
