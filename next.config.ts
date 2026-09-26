import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Imagem Docker enxuta (Dockerfile copia .next/standalone).
  output: "standalone",
  poweredByHeader: false,
  images: {
    // Logos locais (public/brand). As fotos do Appwrite já vêm redimensionadas
    // pela URL de preview e usam <img> direto.
    formats: ["image/webp"],
  },
};

export default nextConfig;
