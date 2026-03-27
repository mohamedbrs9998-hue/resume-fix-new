/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  serverExternalPackages: ['pdf-parse', 'mammoth'],
};

export default nextConfig;
