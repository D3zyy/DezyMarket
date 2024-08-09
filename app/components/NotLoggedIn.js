"use client"
import React from 'react'
import InfoModal from './modals/InfoModal'
import { LockClosedIcon } from '@heroicons/react/24/solid';


const NotLoggedIn = () => {

  return (
    <>
                <div >
                    <div>
                    <LockClosedIcon className="h-20 w-20 text-red-500" /> Pro přístup se prosím přihlaště <button >Přihlásit se</button>
                    </div>
                    <InfoModal defaultOpen={true} message="Pro přístup se prosím přihlašte" />
                </div>
        </>
  )

}

export default NotLoggedIn