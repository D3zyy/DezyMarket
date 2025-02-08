"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

function Post({ postDetails }) {
    const router = useRouter()
    const { id, name, images } = postDetails
    const imageUrl = images.length > 0 ? images[0].url : null  // Pokud není obrázek, nastaví se null

    return (
        <div
            className="cursor-pointer p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:shadow-lg transition flex items-center space-x-4"
            onClick={() => router.push(`/post/${id}`)}
        >
            {/* Levá část - obrázek nebo SVG */}
            <div className="w-24 h-24 flex items-center justify-center rounded-md">
                {imageUrl ? (
                    <Image 
                        quality={75} 
                        loading="lazy" 
                        src={imageUrl} 
                        alt={name} 
                        width={96} // 24 * 4px = 96px
                        height={96}  
                        className="object-cover rounded-md"
                    />
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                )}
            </div>

            {/* Pravá část - informace o příspěvku */}
            <div className="flex-1">
                <h3 className="text-lg font-semibold">{name}</h3>
                {/* Další informace o příspěvku, např. datum, cena, kategorie atd. */}
            </div>
        </div>
    )
}

export default Post