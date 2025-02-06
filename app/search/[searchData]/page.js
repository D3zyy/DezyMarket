import React from 'react'


function page({params}) {
    const searchData = params.searchData


  return (
    <div className='flex max-w-4xl'> 
        vyhledávám: {searchData}
        

    </div>
  )
}

export default page