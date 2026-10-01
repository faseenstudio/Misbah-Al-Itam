import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // e-Slip uploads are capped at 5 MB in the form schema; leave headroom for multipart overhead.
      bodySizeLimit: "6mb",
    },
  },
  images: {
    // Activity and project images served from object storage
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
