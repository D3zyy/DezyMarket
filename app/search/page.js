import React from 'react'


function page({searchParams}) {

    const keyWord= searchParams.keyWord
    const category = searchParams.category
    const section = searchParams.section
    const price = searchParams.price
    const location = searchParams.location


  return (
    <div className='flex max-w-4xl'> 
        keyWord: {keyWord}
        category: {category}
        section: {section}
        price: {price}
        lokace: {location}
        

    </div>
  )
}

export default page