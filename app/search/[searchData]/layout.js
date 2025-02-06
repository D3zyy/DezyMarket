import React from 'react'
import SearchComponent from '@/app/components/SearchComponent'
function layout({children}) {
  return (
    <div >
     <div className='flex justify-center items-center'>

     <div className="join">
  <div>
    <div>
    <SearchComponent/>
    </div>
  </div>
  <select className="select select-bordered join-item">
    <option disabled selected>Kategorie</option>
    <option>Sci-fi</option>
    <option>Drama</option>
    <option>Action</option>
  </select>
  <select className="select select-bordered join-item">
    <option disabled selected>Sekce</option>
    <option>Sci-fi</option>
    <option>Drama</option>
    <option>Action</option>
  </select>
 
</div>

        </div>

     {children}
     
     </div>
  )
}

export default layout