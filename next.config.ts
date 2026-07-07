import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      /** Unggah foto booking/inventaris hingga 5 MB (+ overhead multipart). */
      bodySizeLimit: "6mb",
    },
    /** Dev: always fetch fresh RSC on client navigations (avoids stale layouts/pages). */
    ...(isDev
      ? {
          staleTimes: {
            dynamic: 0,
            static: 0,
          },
        }
      : {}),
  },
  images: {
    formats: ["image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
