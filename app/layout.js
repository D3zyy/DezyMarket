import './globals.css';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import Script from 'next/script';

export const metadata = {

  title: 'Inzerce zdarma,Inzeráty, „Lepší místo pro vaše inzeráty“ Dezy',
  description: 'Dezy je inzertový portál zdarma, který vám nabízí možnost inzerovat a najít širokou škálu produktů, od elektroniky po oblečení. Na našem bazaru můžete snadno prodávat, nakupovat a objevovat nové nabídky ve vašem okolí. S naším sloganem „Lepší místo pro vaše inzeráty“ věříme, že vám přinášíme platformu, která je pohodlná, rychlá a bezpečná pro všechny uživatele.',
  openGraph: {
    locale: 'cs_CZ',
    type: 'website',
    siteName: 'Dezy',
    image: 'https://dezy.cz/icon.png',
    title: 'Inzerce zdarma,Inzeráty, „Lepší místo pro vaše inzeráty“ Dezy',
    description: 'Dezy je inzertový portál zdarma, který vám nabízí možnost inzerovat a najít širokou škálu produktů, od elektroniky po oblečení. Na našem bazaru můžete snadno prodávat, nakupovat a objevovat nové nabídky ve vašem okolí. S naším sloganem „Lepší místo pro vaše inzeráty“ věříme, že vám přinášíme platformu, která je pohodlná, rychlá a bezpečná pro všechny uživatele.',
    url: 'https://dezy.cz',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inzerce zdarma,Inzeráty, „Lepší místo pro vaše inzeráty“ Dezy',
    description: 'Dezy je inzertový portál zdarma, který vám nabízí možnost inzerovat a najít širokou škálu produktů, od elektroniky po oblečení. Na našem bazaru můžete snadno prodávat, nakupovat a objevovat nové nabídky ve vašem okolí. S naším sloganem „Lepší místo pro vaše inzeráty“ věříme, že vám přinášíme platformu, která je pohodlná, rychlá a bezpečná pro všechny uživatele.',
    image: 'https://dezy.cz/icon.png',
  },
  meta: {
    viewport: 'width=device-width, initial-scale=1.0',
    charSet: 'utf-8',
  },
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Dezy',
    url: 'https://dezy.cz',
    description: 'Dezy je inzertový portál zdarma, který vám nabízí možnost inzerovat a najít širokou škálu produktů, od elektroniky po oblečení.',
    publisher: {
      '@type': 'Organization',
      name: 'Dezy',
      logo: 'https://dezy.cz/icon.png',
    },
    image: 'https://dezy.cz/icon.png',
    dateCreated: new Date().toISOString(),
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    mainEntityOfPage: {
      '@type': 'WebSite',
      '@id': 'https://dezy.cz',
    },
    isFamilyFriendly: 'true',
    inLanguage: 'cs-CZ',

  }
};

export default function RootLayout({ children }) {


  return (
    <html lang="cs" style={{ height: '100%' }}>
       <Script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Dezy",
              url: "https://dezy.cz",
              description:
                "Dezy je inzertový portál zdarma, který vám nabízí možnost inzerovat a najít širokou škálu produktů, od elektroniky po oblečení.",
              publisher: {
                "@type": "Organization",
                name: "Dezy",
                logo: "https://dezy.cz/icon.png",
              },
              image:  "https://dezy.cz/icon.png",
              dateCreated:  new Date().toISOString(),
              datePublished:  new Date().toISOString(),
              dateModified: new Date().toISOString(), 
              mainEntityOfPage: {
                "@type": "WebSite",
                "@id": "https://dezy.cz"
              },
              isFamilyFriendly: "true",
              inLanguage: "cs-CZ",
            }),
          }}
        />  
      
      <body style={{ display: 'flex', flexDirection: 'column', height: '100%', margin: '0' }}>
    <CookieConsent />
        <Navigation />
        <main style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: '1300px', padding: '0 20px' }}>{children}</div>
        </main>
        <Footer />
      </body>
    </html>
  );
}