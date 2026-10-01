# 互联网大厂工程架构设计规范文档 (Enterprise Architecture)

本项目遵循互联网一线大厂（Big-Tech Enterprise）前端标准工程规范进行构建，将法国高级设计工程师 Chloé Maillot 的极致视觉美学与高可靠、高可用、可降级的现代架构设计深度结合。

---

## 1. 总体架构分层

系统采用清晰的四层关注点分离（Separation of Concerns, SoC）架构：

```
┌─────────────────────────────────────────────────────────────┐
│                 1. 页面与路由层 (App Router)                │
│    / (首页五板块)  │  /article/[slug]  │  /notes/[slug]    │
│    /article (归档) │  /friends (友链)  │  /components/demo │
└──────────────────────────────┬──────────────────────────────┘
                               │ 依赖组合
┌──────────────────────────────▼──────────────────────────────┐
│             2. 表现层组件库 (Presentation & Modules)         │
│  - modules/ (Header, Note, Article, Photo, Friend, Comment) │
│  - core/    (ContentRow, HaloFrame, PageThumb, Stamp)        │
│  - ui/      (Badge, SpringModal, TextLink, NoiseOverlay)    │
└──────────────────────────────┬──────────────────────────────┘
                               │ 状态与钩子
┌──────────────────────────────▼──────────────────────────────┐
│                3. 服务与领域层 (Service Gateway)             │
│  - services/ (profileService, noteService, articleService)  │
│  - constants/ (FALLBACK_*, SITE_CONFIG)                     │
│  - hooks/    (useSound, useClock, useTheme)                 │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / BFF 转发
┌──────────────────────────────▼──────────────────────────────┐
│              4. 数据通信契约 (Spring Boot Backend)          │
│  - Next.js Rewrites: /api/* -> http://localhost:8080/api/*   │
│  - 纯只读接入已有 Spring Boot 2.0 后端，无侵入式集成         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 目录规范与职责边界

| 目录路径 | 规范定义与职责 | 约束原则 |
| :--- | :--- | :--- |
| `src/app/` | 页面路由入口与 Server Components | 仅做数据分发与服务端元数据（Metadata）注入，不做复杂逻辑 |
| `src/components/ui/` | 纯通用原子 UI 原语 | 严禁依赖任何业务服务与特定数据结构 |
| `src/components/core/` | 跨板块核心统一组件 | 承载全站统一微交互规范（如 `ContentRow`、`HaloFrame`） |
| `src/components/modules/` | 业务板块拼装容器 | 独立状态管理，支持独立插拔与重构 |
| `src/services/` | 统一网络请求与防腐层 | 包含离线优雅降级、超时重试与异常兜底 |
| `src/types/` | 严格 TypeScript 类型定义 | 100% 映射后端 POJO/DTO/VO，禁止出现 `any` |
| `src/constants/` | 静态常量与兜底数据字典 | 业务兜底数据，后端挂掉时保障站点秒级正常呈现 |
| `src/utils/` | 无副作用纯函数工具 | 数学几何算法、哈希、日期处理等 |

---

## 3. BFF 网络与安全代理 (Network & BFF Proxy)

前端开发服务器与生产服务器通过 `next.config.mjs` 中的 `rewrites` 机制，将 `/api/*` 和 `/uploads/*` 自动反向代理到 Spring Boot 业务端（8080 端口）：

```javascript
// next.config.mjs
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
}
```

### 优势
1. **解决跨域 (CORS)**：前端浏览器视角所有请求均为同源，无需后端配置复杂的 CORS 头。
2. **后端无感**：完全无需改动已有的 Spring Boot 后端工程代码。
3. **真实 IP 透传**：前端服务层 `HttpClient` 封装自动注入 `X-Real-IP`、`User-Agent` 与 `Accept: application/json` 请求头，完美适配后端的访客分析与点赞限流防刷逻辑。

---

## 4. 高可用兜底与容灾策略 (Resilience & Degradation)

在现代大厂工程实践中，个人博客前台需要具备极高的鲁棒性。当本地 Spring Boot 后端未启动或网络故障时，站点**绝不白屏、绝不崩溃**：

1. **兜底数据仓库 (`src/constants/fallbacks.ts`)**：内置了完整的博主 Profile、置顶手记、核心文章、精选相册与精选友链。
2. **服务层统一 Catch 降级**：所有 `*Service` 中的数据请求均包含熔断机制，一旦后端返回非 200 或网络拒绝连接，立即静默降级为 Fallback 数据。
3. **乐观更新 (Optimistic UI)**：点赞与评论操作在前端优先触发视觉更新与音效播放，后台异步提交，提供零延迟极致触觉体验。

---

## 5. 依赖包管理与构建规范

- **包管理工具**：强制锁定使用 `pnpm`。
- **构建命令**：`pnpm build`（基于 Turbopack/Next.js SWC 极速编译）。
- **运行环境**：Node.js >= 20.x。
