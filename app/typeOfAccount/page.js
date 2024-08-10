import React from 'react'
import { getSession } from '../authentication/actions'
import NotLoggedIn from '../components/NotLoggedIn'

const  page = async() => {
    const session = await getSession()
    console.log("session : ",session)

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