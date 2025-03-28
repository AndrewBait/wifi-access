/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Desabilitar ESLint durante o build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Opcional: também ignorar erros de TypeScript
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;