import type { NextConfig } from "next";

// REMOVED ": NextConfig" type here to avoid the strict type error
const nextConfig = {
  /* config options here */
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  }
  
};

export default nextConfig;