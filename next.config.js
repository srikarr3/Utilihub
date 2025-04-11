/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // For GitHub Pages deployment, uncomment and update with your repo name
  // basePath: '/utilihub',
  // assetPrefix: '/utilihub/',
  
  // If you're using Next.js 13+ with the app directory
  output: 'export',
  
  // Optional: Disable image optimization for static export
  images: {
    unoptimized: true,
  }
}

module.exports = nextConfig