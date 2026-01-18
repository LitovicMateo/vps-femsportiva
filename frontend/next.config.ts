import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    // Empty config to allow Turbopack with webpack settings
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 500, // Check for changes every 500ms
        aggregateTimeout: 300, // Delay before rebuilding
        ignored: /node_modules/,
      };
    }
    return config;
  },
};

export default nextConfig;
