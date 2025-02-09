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
    
    ],
    minimumCacheTTL: 300,
  },

};

export default nextConfig;