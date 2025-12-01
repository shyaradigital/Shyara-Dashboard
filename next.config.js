/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Use standalone output for better deployment on Render
  output: "standalone",
  // Ensure proper static file serving
  trailingSlash: false,
  // Exclude backend folder from compilation
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ["**/backend/**", "**/node_modules/**"],
    }
    return config
  },
  // Exclude backend from page extensions
  pageExtensions: ["tsx", "ts", "jsx", "js"],
}

module.exports = nextConfig
