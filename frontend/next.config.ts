import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Konteyner imajı için gerekli: Next yalnızca gerçekten kullanılan modülleri
  // .next/standalone altına kopyalar, böylece imaja node_modules taşımak
  // gerekmez. Docker dışında bir etkisi yok.
  output: "standalone",
  images: {
    // Snippet kartlarındaki video kapakları YouTube'un thumbnail CDN'inden gelir.
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
      { protocol: "https", hostname: "img.youtube.com", pathname: "/vi/**" },
    ],
  },
};

export default nextConfig;
