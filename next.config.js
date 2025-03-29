/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Desabilitar ESLint durante o build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorar erros de TypeScript durante build
    ignoreBuildErrors: true,
  },
  // Configurações adicionais
  swcMinify: true,
  reactStrictMode: true,
};

module.exports = nextConfig;