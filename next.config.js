/** @type {import('next').NextConfig} */
module.exports = {
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  images: { unoptimized: true },
  outputFileTracingRoot: __dirname,
  outputFileTracingIncludes: {
    '/api/board': ['./data/board-screen-v1.webp'],
    '/api/games/*/pdf/status': ['./data/fonts/*.ttf'],
  },
  serverExternalPackages: ['pdfkit'],
}
