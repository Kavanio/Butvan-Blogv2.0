/**
 * 统一 HTTP 网络客户端 (基于原生 Fetch，满足大厂无重型依赖规范)
 */

import { Result } from "@/types/api";

function getApiBase(): string {
  // 1. 服务端 Node.js (SSR / ISR / Server Components) 环境
  if (typeof window === "undefined") {
    if (process.env.INTERNAL_BACKEND_URL) {
      return process.env.INTERNAL_BACKEND_URL.replace(/\/$/, "");
    }
    if (process.env.BACKEND_API_URL) {
      return process.env.BACKEND_API_URL.replace(/\/$/, "");
    }
    // 默认直连本地 Spring Boot 8080 API
    return "http://127.0.0.1:8080/api";
  }

  // 2. 浏览器客户端环境：优先读取环境变量，默认走 Next.js rewrites 反向代理
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "");
  }
  return "/api";
}

const TIMEOUT_MS = 8000;

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const base = getApiBase();
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${base}${path}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json;charset=UTF-8";
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`HTTP_${res.status}: ${res.statusText}`);
    }

    const json = (await res.json()) as Result<T>;
    if (json.code !== 200 && json.code !== 0) {
      throw new Error(json.msg || `Business error with code ${json.code}`);
    }

    return json.data;
  } catch (err: unknown) {
    clearTimeout(timer);
    throw err;
  }
}

export const http = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "GET" }),
  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
};
