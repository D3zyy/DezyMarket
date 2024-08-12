import './globals.css';
import Navigation from './components/Navigation';
import Footer from './components/Footer';



export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <head>
        <title>Dezy - Nakupuj, inzeruj a prodávej „de to i online.“</title>
        <meta name="description" content="Nakupujte, inzerujte a prodávejte své nepotřebné věci. Vše na jednom místě, přehledné a uživatelsky přívětivý portál, který Vás provede celým procesem ať už inzerujete či nakupujete." />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content='Dezy - Nakupuj, inzeruj a prodávej „de to i online.“'></meta>
        <meta property="og:description" content="Nakupujte, inzerujte a prodávejte své nepotřebné věci. Vše na jednom místě, přehledné a uživatelsky přívětivý portál, který Vás provede celým procesem ať už inzerujete či nakupujete." />
        <meta property="og:image" content="URL k obrázku" />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
        <meta charSet="UTF-8"></meta>
        
     </head>
      <body>
        
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
