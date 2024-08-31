import { redirect } from 'next/navigation';
import React from 'react'
import { getSession } from '../authentication/actions';
import { openLoginModal } from '../components/modals/LoginModal';
import NotLoggedIn from '../components/NotLoggedIn';
import { getUserAccountType } from '../typeOfAccount/Methods';

const page = async ()  => {
    const session = await getSession();
    let accType = await getUserAccountType(session.userId)

    if (!accType && session.isLoggedIn) redirect('/typeOfAccount');
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