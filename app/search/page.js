import React from 'react'


function page({searchParams}) {
    const keyWord= searchParams.searchData
    const category = searchParams.category
    const section = searchParams.section
    const price = searchParams.price


  return (
    <div className='flex max-w-4xl'> 
        keyWord: {keyWord}
        category: {category}
        section: {section}
        price: {price}
        

    </div>
  )
}

export default page