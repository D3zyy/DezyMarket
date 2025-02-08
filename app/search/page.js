import React from 'react'
import { prisma } from '../database/db'
import Post from './Post'

async function page({ searchParams }) {
    const { keyWord, category, section, price, location } = searchParams

    const filters = {
      ...(category && { category: { is: { name: category } } }),
      ...(section && { section: { is: { name: section } } }),
      ...(price && { price }),
      ...(location && { location })
  }
    console.log("filtres:",filters)
    const filteredPosts = await prisma.posts.findMany({
        where: {
            ...filters,
            OR: keyWord
                ? [
                      { name: { search: `${keyWord}:*` } },
                      { description: { search: `${keyWord}:*` } }
                  ]
                : undefined
        },
        include: {
            images: {
                take: 1 
            }
        }
    })
    console.log("Našel sem:",filteredPosts)
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPosts.map((post) => (
                <Post key={post.id} postDetails={post} />
            ))}
        </div>
    )
}

export default page