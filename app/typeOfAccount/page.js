import React from 'react'
import { getSession } from '../authentication/actions'
import NotLoggedIn from '../components/NotLoggedIn'
import { redirect } from 'next/navigation';
const  page = async() => {
  const session = await getSession()
  if (!session.isLoggedIn)  redirect('/');
  if(!session.accountType){
    console.log("ješte nevybral účet")
  }
  return (
    <div>
    {session.isLoggedIn ? (
    "prihlasen tady se zobrazi druhy uctu podle vaseho uctu"
  ) : (
    <NotLoggedIn />
  )}

</div>
  )
}

export default page