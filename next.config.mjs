/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Required for sql.js WASM support in the browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    // Allow sql.js to load the WASM binary as an asset
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });
    return config;
  },
  // Allow importing .wasm files
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
};

export default nextConfig;
