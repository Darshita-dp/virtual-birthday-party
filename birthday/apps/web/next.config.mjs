/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@dvb/config", "@dvb/protocol"],
};

export default nextConfig;
