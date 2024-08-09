
import React from 'react'
import { getSession } from '../authentication/actions';
import { openLoginModal } from '../components/modals/LoginModal';

const page = async ()  => {
    const session = await getSession();



  return (
    <div>
        {session.isLoggedIn ? (
        "prihlasen"
      ) : (
        "neprihlasen"
      )}
      přidat inzerát
    </div>
  )
}

export default page