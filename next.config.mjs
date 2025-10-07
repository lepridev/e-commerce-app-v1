/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      // Vous pouvez ajouter d'autres domaines ici si nécessaire
      // {
      //   protocol: 'https',
      //   hostname: 'exemple.com',
      //   port: '',
      //   pathname: '/**',
      // },
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
