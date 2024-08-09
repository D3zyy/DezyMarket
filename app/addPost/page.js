
import React from 'react'
import { getSession } from '../authentication/actions';
import { openLoginModal } from '../components/modals/LoginModal';
import NotLoggedIn from '../components/NotLoggedIn';

const page = async ()  => {
    const session = await getSession();



  return (
    <div>
        {session.isLoggedIn ? (
        "prihlasen"
      ) : (
        <NotLoggedIn />
      )}
   
    </div>
  )
}

export default page