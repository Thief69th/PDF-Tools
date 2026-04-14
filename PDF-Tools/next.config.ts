import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Allow access to remote image placeholder.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // This allows any path under the hostname
      },
    ],
  },
  output: 'standalone',
  staticPageGenerationTimeout: 300,
  swcMinify: false,
  compress: false,
  transpilePackages: ['motion', 'pdfjs-dist'],
  webpack: (config, {dev, isServer}) => {
    // Enable top-level await
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };

    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }

    // Prevent fetch polyfill conflicts on the client
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'isomorphic-fetch': false,
        'whatwg-fetch': false,
        'node-fetch': false,
      };
    }

    return config;
  },
};

export default nextConfig;
