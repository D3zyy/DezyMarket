"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

function Post({ postDetails , section}) {
    const router = useRouter()
    const { id, name, images } = postDetails
    const imageUrl = images.length > 0 ? images[0].url : null
    const hasTop = postDetails?.top !== null && ( !section || section && postDetails?.AllTops);
 

    return (
        <div
            className="mb-5 cursor-pointer p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:shadow-lg transition flex flex-col justify-center"
            onClick={() => router.push(`/post/${id}`)}
        >
            {/* Podmíněné zobrazení badge */}
            {hasTop &&  (
                <div className="flex justify-start mb-2 min-h-[2rem]">
                    <div
                        className="badge badge-md badge-outline px-3 py-3"
                        style={{
                            fontSize: '0.875rem',
                            padding: '10px',
                            borderWidth: '1.2px',
                            borderStyle: 'solid',
                            height: '2rem',
                            borderColor: postDetails?.top?.color,
                        }}
                    >
                        <Link
                            href={'#'}
                            style={{ fontWeight: 'bold', fontSize: '1rem', color: postDetails?.top?.color }}
                            
                        >
                            {postDetails?.top?.emoji ? (
                                <span className="mr-1" dangerouslySetInnerHTML={{ __html: postDetails?.top?.emoji }}></span>
                            ) : (
                                ""
                            )}
                            {postDetails?.top?.name}
                        </Link>
                    </div>
                </div>
            )}

            {/* Obsah příspěvku centrovaný vertikálně */}
            <div className="flex break-all items-center justify-center space-x-4 flex-grow">
                <div className="w-24    flex-shrink-0 h-24 flex items-center justify-center rounded-md">
                    {imageUrl ? (
                      <Image 
                      quality={65} 
                      loading="lazy" 
                      src={imageUrl} 
                      alt={name} 
                      width={75}
                      height={75}  
                      className="object-contain flex-shrink-0 rounded-md"
                      style={{ width: 'auto', height: 'auto' }} 
                  />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className=" w-16 h-16 flex-shrink-0 text-gray-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                    )}
                </div>

                <div className="flex-1">
                    <h3 className="text-lg  font-semibold">{name}</h3>
                    <h6 className="flex flex-row gap-4 items-center mt-1 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6  flex-shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                        {postDetails.location}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 flex-shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                                        {Number.isInteger(Number(postDetails?.price)) 
                ? `${Number(postDetails?.price).toLocaleString('cs-CZ')} Kč` 
                : postDetails?.price}
                    </h6>
                 
                   
          
                </div>
            </div>
        </div>
    )
}

export default Post