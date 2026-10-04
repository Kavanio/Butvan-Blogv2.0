# Butvan Blog 2.0 — 新一代极客博客前台 (Frontend Next)

> ✨ **Design Engineer Portfolio & Personal Blog**  
> 灵感源自法国高级设计工程师 **Chloé Maillot** (`https://chloemaillot.fr/`) 的极致排版与触觉反馈系统。基于 **Next.js 15 (App Router)** + **React 19** + **Tailwind CSS** + **Framer Motion** + **Web Audio API** 构建，采用互联网大厂分层规范设计，全无侵入对接已有 Spring Boot 3.x 后端。

---

## 🎨 核心设计与交互系统

1. **五大板块首页流动**：
   - **Header**：极简 Typography 名片、北京时钟、扑克牌芯片组扇形展开与悬浮 1.55 倍回正动效；
   - **Note**：碎片随笔手记列表，统一行微缩文档骨架与哈希确定性倾角；
   - **Article**：深度架构长文列表，与 Note 共享统一微交互组件；
   - **Photo**：1040px 突破全宽交互式照片拼贴画板（Photo Scrapbook Board），18 张真实拍立得卡片、法式打孔邮票、自由拖拽碰撞与悬浮景深对焦微动效；
   - **Friend**：底部邻居友链板块，支持一键复制本站信息与在线交换申请模态框；
   - **Signature**：页尾右下角手写矢量签名。

2. **多级动态路由页面**：
   - `/article/[slug]`：长文阅读器，Markdown 富文本排版、代码高亮、点赞与树状嵌套评论系统（`CommentSection`）；
   - `/notes/[slug]`：轻量手记阅读器，心情/天气/地点徽章与点赞共鸣；
   - `/article`：全量文章归档，支持即时关键词搜索与分类标签筛选；
   - `/friends`：独立全网邻居友链天地。

3. **物理触觉音效系统 (Audio Tactile System)**：
   - 基于纯 Web Audio API 程序化振荡器合成，无需下载任何外部音频文件；
   - 具备 `tick`、`droplet`、`release`、`sparkle`、`success` 等丰富触觉反馈。

4. **大厂工程规范与容灾降级**：
   - 架构文档与组件手册位于 [docs/COMPONENTS.md](docs/COMPONENTS.md) 与 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)；
   - 全局数据服务层集成 **离线兜底降级策略 (Resilience Fallback)**，后端服务断开时前台秒级优雅降级，绝不白屏崩溃。

---

## 🚀 本地开发与启动

开发服务器使用 `.next-dev/` 作为独立构建目录，生产构建使用 `.next/`，避免 `next build` 覆盖运行中的开发服务器清单。

### 1. 安装依赖
```bash
pnpm install
```

### 2. 启动开发服务器
```bash
pnpm dev
```
打开浏览器访问 [http://localhost:3000](http://localhost:3000)。

### 3. 生产打包构建
```bash
pnpm build
pnpm start
```

---

## 🔗 后端反向代理配置

本项目在 `next.config.mjs` 中内置了 BFF 反向代理规则：
- `/api/*` 自动反向代理到 `http://localhost:8080/api/*`；
- `/uploads/*` 自动反向代理到 `http://localhost:8080/uploads/*`；
开发与部署时无需在后端配置复杂跨域规则，直接开箱即用。
