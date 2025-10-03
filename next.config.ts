// next.config.mjs
import withPWA from "@ducanh2912/next-pwa";

const pwaConfig = withPWA({
  dest: "public", // Destination directory for the PWA files
  register: true, // Automatically register the service worker
  disable: process.env.NODE_ENV === "development", // Disable PWA in development mode
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
};

export default pwaConfig(nextConfig);
