import React from 'react'
import SearchComponent from '@/app/components/SearchComponent'

function Layout({ children }) {
  
    return (
    <div>
<div className="fixed top-20 left-1/2 transform -translate-x-1/2 flex justify-center items-center z-5  p-4">
        <div className="join">
          <div>
            <SearchComponent />
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

export default Layout