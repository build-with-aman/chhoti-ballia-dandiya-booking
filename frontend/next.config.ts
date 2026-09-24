import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/chhoti-ballia-dandiya-booking",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
