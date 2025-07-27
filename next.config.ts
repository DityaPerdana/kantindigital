import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.nabatisnack.co.id',
        pathname: '/assets/icons/product/wafer/ic-wafer-3.png',
      },
      {
        protocol: 'https',
        hostname: 'solvent-production.s3.amazonaws.com',
        pathname: '/media/images/products/2021/09/DSC_0272.JPG',
      },
    ],
  },
};

export default nextConfig;
