import React from 'react'
import Link from 'next/link'
import AuthenticateUser from './AuthenticateUser'

const Navigation = () => {
  return (
    <div className="navbar bg-base-100">
          <div className="flex-1">
            <Link href="/" className="btn btn-ghost text-xl">DezyMarket</Link>
          </div>
          <div>
            <AuthenticateUser />
          </div>
    </div>
  )
}

export default Navigation