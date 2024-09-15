import { redirect } from 'next/navigation';
import React from 'react'
import { getSession } from '../authentication/actions';
import { openLoginModal } from '../components/modals/LoginModal';
import NotLoggedIn from '../components/NotLoggedIn';
import { getUserAccountType, getUserAccountTypeOnStripe } from '../typeOfAccount/Methods';

const page = async ()  => {
    const session = await getSession();
    console.log(session)
    let accType = await getUserAccountTypeOnStripe(session.email)
    console.log("jmeno uctu pri zobrazeni AddPost:",accType)
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