import React from 'react'
import Link from 'next/link'
import AuthenticateUser from './AuthenticateUser'
import { Pacifico} from 'next/font/google';
import { Bebas_Neue } from 'next/font/google'


const babes = Bebas_Neue({
    subsets: ['latin'],
    variable: '--font-babes',
    weight: '400',
    display: 'swap'
  }) 

const pacifico = Pacifico({
  subsets: ['latin'],
  variable: '--font-pacifico',
  weight: '400',
  display: 'swap'
})

const Navigation = async () => {

  return (
    <div className="navbar bg-base-100">
          <div className="flex-1">
          <Link href="/"className={`${babes.className} btn btn-ghost text-xl`}style={{ fontSize: "1.5rem" }}>Dezy</Link>
          <span  className={pacifico.className} style={{ marginLeft: "5px"}}>„když chci být vidět.“</span> 
          </div>
          <div>
            <AuthenticateUser />
          </div>
    </div>
  )
}

export default Navigation