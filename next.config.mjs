/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.bazos.cz',
      },
      {
        protocol: 'https',
        hostname: 'photos.dezy.cz', // Přidejte tento nový hostname
      },
      // Pokud máte další hostitele, přidejte je sem:
      // {
      //   protocol: 'https',
      //   hostname: 'další-hostname.cz',
      // },
    ],
  },

};

export default nextConfig;