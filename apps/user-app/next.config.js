/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@foodmart/shared', '@foodmart/database'],
};

module.exports = nextConfig;
