/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Use standalone output for better deployment on Render
  output: "standalone",
  // Ensure proper static file serving
  trailingSlash: false,
}

module.exports = nextConfig
