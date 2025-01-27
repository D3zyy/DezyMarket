import React from 'react'
import MenuByRole from './MenuByRole'
import { getSession } from '../authentication/actions'
import { redirect } from 'next/navigation';
const Page = async () => {
    const session = await getSession();
    console.log(session)

  if(!session || session?.role?.privileges <= 1|| !session.isLoggedIn || !session.email ){
      redirect('/');
  }
  return (
    <div>
      {session.role.privileges > 1 && 
       <MenuByRole privileges={session.role.privileges} />
      }
     




    </div>
  )
}

export default Page