import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ujloxuirihvpdzqtgfpx.supabase.co', 
        pathname: '/storage/v1/object/sign/customers/*'
      }
    ]
  }
};

export default nextConfig;
