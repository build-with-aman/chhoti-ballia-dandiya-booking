import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow LAN IP to download JS chunks and HMR in development
  allowedDevOrigins: ["192.168.1.7", "192.168.1.7:3000"],
};

export default nextConfig;
