"use client"
import React from 'react'
import InfoModal from './modals/InfoModal'



const NotLoggedIn = () => {

  return (
    <>
                <div >
                    <div style={{textAlign: "center", marginBottom: "900px"}}>
                    <span className="loading loading-dots loading-lg"></span>
                    </div>
                    <InfoModal defaultOpen={true} message="Pro pokračování se prosím přihlaste" />
                </div>
        </>
  )

}

export default NotLoggedIn