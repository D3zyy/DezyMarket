import React from 'react';
import Link from 'next/link';
import AuthenticateUser from './AuthenticateUser';
import localFont from 'next/font/local';

const pacifico = localFont({
  src: '../../public/fonts/pacifico/Pacifico-Regular.ttf', // Začíná lomítkem
  weight: '400',
  style: 'normal',
});

const bebas = localFont({
  src: '../../public/fonts/Bebas_Neue/BebasNeue-Regular.ttf', // Začíná lomítkem
  weight: '400',
  style: 'normal',
});

const Navigation = () => {
  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        {/* Použití Bebas Neue fontu pro odkaz */}
        <Link
          href="/"
          className={`${bebas.className} btn btn-ghost`}
          style={{ fontSize: '1.8rem' }}
        >
          Dezy
        </Link>
        {/* Použití Pacifico fontu pro slogan */}
        <span
          className={pacifico.className}
          style={{ marginLeft: '10px', fontSize: '1rem' }}
        >
          „když chci něco víc.“
        </span>
      </div>
      <div>
        <AuthenticateUser />
      </div>
    </div>
  );
};

export default Navigation;