import type { NextConfig } from "next";
import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

// Initialize Cloudflare platform emulation for local development
if (process.env.NODE_ENV === "development") {
  setupDevPlatform().catch(err => console.error("Cloudflare Dev Platform Error:", err));
}

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
