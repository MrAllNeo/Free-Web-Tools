import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Snippet kartlarındaki video kapakları YouTube'un thumbnail CDN'inden gelir.
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
      { protocol: "https", hostname: "img.youtube.com", pathname: "/vi/**" },
    ],
  },
};

export default nextConfig;
