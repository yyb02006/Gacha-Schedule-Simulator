import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      '*.svg': {
        loaders: [
          {
            loader: '@svgr/webpack',
            options: {
              icon: true,
            },
          },
        ],
        as: '*.js',
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-cee3b616ec754cb4b3678740fdae72a5.r2.dev',
        pathname: '/**',
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
