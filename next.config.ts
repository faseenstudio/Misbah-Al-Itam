import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Activity and project images served from object storage
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
