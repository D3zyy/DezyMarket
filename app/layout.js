// app/layout.js
import Link from 'next/link';
import './globals.css';
import AuthenticateUser from './components/AuthenticateUser'; 
import Footer from './components/Footer';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="navbar bg-base-100">
          <div className="flex-1">
            <a className="btn btn-ghost text-xl">DezyMarket</a>
          </div>
        <div>
            
            <AuthenticateUser />
          </div>
        </div>
        <main>{children}</main>
        <Footer />
       
      </body>
    </html>
  );
}