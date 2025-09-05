import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      // Silence workspace root inference warning in monorepo by setting explicit root
      root: "..",
    },
  },
};

export default nextConfig;
