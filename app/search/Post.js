"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
function Post({ postDetails }) {
    const router = useRouter()
    const { id, name, images } = postDetails
    const imageUrl = images.length > 0 ? images[0].url : '/https://loremflickr.com/200/200?random=1' // Pokud není obrázek, použije se výchozí

    return (
        <div
            className="cursor-pointer p-4 border rounded-lg hover:shadow-lg transition"
            onClick={() => router.push(`/post/${id}`)}
        >
            <Image src={imageUrl} alt={name} width={100} height={100}  className=" object-cover rounded-md" />
            <h3 className="mt-2 text-lg font-semibold">{name}</h3>
        </div>
    )
}

export default Post