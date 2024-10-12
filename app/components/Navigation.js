import React from 'react'
import Link from 'next/link'
import AuthenticateUser from './AuthenticateUser'
import { Pacifico } from 'next/font/google';
import { Bebas_Neue } from 'next/font/google'

// Import and assign the fonts correctly
const pacifico = Pacifico({ subsets: ['latin'], weight: '400' });
const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400' });

const Navigation = () => {
  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        {/* Apply Bebas Neue font to the Link with larger font size */}
        <Link href="/" className={`${bebas.className} btn btn-ghost`} style={{ fontSize: "1.8rem" }}>
          Dezy
        </Link>
        {/* Apply Pacifico font to the slogan with larger font size */}
        <span className={pacifico.className} style={{ marginLeft: "10px", fontSize: "1rem" }}>
          „když chci něco víc.“
        </span>
      </div>
      <div>
        <AuthenticateUser />
      </div>
    </div>
  )
}

export default Navigation