# -----------------
# 1. 依赖安装阶段
# -----------------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm@9 && pnpm i --frozen-lockfile

# -----------------
# 2. 编译构建阶段
# -----------------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 删除本地开发环境变量文件，避免 Next.js 构建时将开发地址固化到客户端 JS
RUN rm -f .env.local .env.dev .env.sealos

# 构建时注入后端地址，让 Next.js rewrites 代理目标指向 Docker 内网的后端服务
ENV BACKEND_URL=http://blog-service:8080
ENV INTERNAL_BACKEND_URL=http://blog-service:8080/api
# 清空 NEXT_PUBLIC_* 变量，由浏览器运行时相对路径自动走反代
ENV NEXT_PUBLIC_API_BASE_URL=""

RUN npm install -g pnpm@9 && pnpm build

# -----------------
# 3. 运行阶段
# -----------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV NODE_OPTIONS="--max-old-space-size=256"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 仅拷贝构建所必需的独立运行文件，以缩减镜像体积
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
