import type { NextConfig } from "next";
import path from "node:path";

// 后端 Spring Boot 服务地址（开发环境代理目标）
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

// 局域网 dev 来源白名单，可通过 NEXT_PUBLIC_DEV_ORIGINS=10.0.0.1,192.168.1.2 覆盖
const allowedDevOrigins = process.env.NEXT_PUBLIC_DEV_ORIGINS
  ? process.env.NEXT_PUBLIC_DEV_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean)
  : ["10.100.135.154"];

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins,
  /**
   * 显式指定 Turbopack 根目录为当前前端子项目路径。
   * 防止 Turbopack 默认向上查找 Git 根目录作为 root 导致无法解析 next 包抛出 panic 并引起客户端死循环刷新
   */
  turbopack: {
    root: path.resolve(__dirname),
  },
  /**
   * 将 /api/*、/uploads/* 代理到后端，支持同源访问。
   * Docker 容器内通过 BACKEND_URL 环境变量指定后端地址。
   */
  async rewrites() {
    const proxyTarget = process.env.BACKEND_URL || backendUrl;
    return [
      {
        source: "/api/:path*",
        destination: `${proxyTarget}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${proxyTarget}/uploads/:path*`,
      },
    ];
  },
  // 为 @imgly/background-removal 的 SharedArrayBuffer 提供所需的安全头
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      // MinIO 对象存储（生产环境 HTTPS 自定义域名）
      {
        protocol: "https",
        hostname: "minio.server.butvan.top",
        pathname: "/blog2/**",
      },
      // MinIO 对象存储（开发环境 IP 直连）
      {
        protocol: "http",
        hostname: "47.102.205.85",
        port: "19000",
        pathname: "/blog2/**",
      },
    ],
  },
};

export default nextConfig;
