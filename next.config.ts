/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint:{
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', 
        pathname: '/**', // Allow all paths
      },
    ],
  },
};

module.exports = nextConfig;
