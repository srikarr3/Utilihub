
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for GitHub Pages
  basePath: process.env.NODE_ENV === 'production' ? '/Utilhub' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/Utilhub/' : '',
  
  // Enable static exports
  images: {
    unoptimized: true,
  }
}

module.exports = nextConfig