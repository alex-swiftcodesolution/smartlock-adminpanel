// next.config.ts
import withPWA from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "euimagesd2h2yqnfpu4gl5.cdn5th.com",
        pathname: "**", // ← add this
      },
      {
        protocol: "https",
        hostname: "images.tuyaeu.com",
        pathname: "**", // ← add this
      },
    ],
  },
};

export default pwaConfig(nextConfig);
