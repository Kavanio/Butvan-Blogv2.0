/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 开发服务器与生产构建使用独立产物目录，避免互相清理对方的路由清单。
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/api/:path*",
      },
      {
        source: "/uploads/:path*",
        destination: "http://localhost:8080/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
