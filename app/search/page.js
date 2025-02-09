import React from 'react'
import { prisma } from '../database/db'
import Post from './Post'
import PostsPage from '../components/PostsPage'
async function page({  }) {
    

    return (
        
           <PostsPage />
          
     
    )
}

export default page
