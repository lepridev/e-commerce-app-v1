/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "firebasestorage.googleapis.com",
      "res.cloudinary.com", // Cloudinary
    ],
  },
  experimental: {
    serverComponentsExternalPackages: [],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      stream: false,
    };
    return config;
  },
};
export default nextConfig;
