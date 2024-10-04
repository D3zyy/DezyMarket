import './globals.css';
import Navigation from './components/Navigation';
import Footer from './components/Footer';

export default function RootLayout({ children }) {
  return (
    <html lang="cs" style={{ height: '100%' }}>
      <head>
        <title>Dezy - Nakupuj, inzeruj a prodávej „de to i online.“</title>
        <meta name="description" content="Nakupujte, inzerujte a prodávejte své nepotřebné věci. Vše na jednom místě, přehledné a uživatelsky přívětivý portál, který Vás provede celým procesem ať už inzerujete či nakupujete." />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content='Dezy - Nakupuj, inzeruj a prodávej „de to i online.“' />
        <meta property="og:description" content="Nakupujte, inzerujte a prodávejte své nepotřebné věci. Vše na jednom místě, přehledné a uživatelsky přívětivý portál, který Vás provede celým procesem ať už inzerujete či nakupujete." />
        <meta property="og:image" content="URL k obrázku" />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
      </head>
      <body style={{ display: 'flex', flexDirection: 'column', height: '100%', margin: '0' }}>
        <Navigation />
        <main style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: '1200px', padding: '0 20px' }}>
            {children}
          </div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
