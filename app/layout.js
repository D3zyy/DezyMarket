
import Link from 'next/link';
import './globals.css';
import Navigation from './components/Navigation';
import Footer from './components/Footer';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        <main>{children}</main>
        <Footer />
       
      </body>
    </html>
  );
}