# Butvan Blog 2.0 — 可梵的个人博客系统 2.0

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-green.svg)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black.svg)](https://nextjs.org/)
[![HeroUI](https://img.shields.io/badge/HeroUI-v3-blue.svg)](https://heroui.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-blueviolet.svg)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Butvan Blog 2.0** 是一款融合了**拟真沉浸式房间场景交互**与**大厂级现代化微服务架构设计**的个人博客系统。
> 采用双端分离架构（用户展示端 + 后台管理端），后端基于多模块 Spring Boot 构建，全流程遵循高度规范的工程实践。

---

## 🌟 核心特色与交互动效

### 1. 抠图切片悬浮动效 (PNG Sprite Overlay)
系统主页放弃了传统博客的卡片化瀑布流，转而采用一个高度拟真的“沉浸式房间”场景：
*   **多图层渲染**：底层为房间高清背景图，上层通过百分比坐标绝对叠放各个物品的透明背景 `.png` 切片。
*   **物理悬浮交互**：当鼠标 Hover 在特定物品（如电脑、台灯、书架）上时，物品应用 3D 变换微微浮起 (`translateY(-8px) scale(1.03)`)，并附带避光漫反射边缘投影与深海冷光微发光效果。
*   **镜头对焦聚焦**：点击物品后，镜头平滑拉近并放大对焦至对应热区，带来极致流畅的交互过渡。

### 2. 框选自动裁剪工作流 (Box-Select & Auto-Crop)
为了简化管理员配置房间热区物品的成本，后台重构并实现了**先框选裁剪、后上传精抠**的混合工作流：
*   **可视化拼贴器**：管理员直接在背景图画布上进行鼠标**拖拽绘制框选**。
*   **像素级裁剪**：松开鼠标后，利用浏览器离屏 Canvas API 自动对所选矩形区域像素进行裁剪，并一键生成 PNG 自动上传关联热区记录。
*   如果需要完全抠除背景的纯净悬浮效果，支持二次上传设计师精抠的透明 PNG 贴图无缝替换。

---

## 🛠️ 技术选型清单

### 🖥️ 前端展示端 & 管理后台
*   **新一代设计工程师博客前台 (`frontend-next/`)**：
    *   **核心框架**：Next.js 15 (App Router) + React 19 + TypeScript
    *   **动效与音效**：Framer Motion + Web Audio API 程序化物理音效合成
    *   **设计美学**：1:1 复刻法国高级设计工程师 Chloé Maillot 极客美学，1040px 交互式照片拼贴画板、确定性哈希倾角、微胶片噪点与打孔邮票。
    *   **架构体系**：互联网大厂分层规范设计，全接口无侵入对接 `backend` 8080 服务并集成离线熔断兜底。
*   **原双端工程 (`fronted/`)**：
    *   `blog-client`：基于房间拟真切片场景的用户前台
    *   `blog-admin`：基于 HeroUI v3 + Tailwind CSS 的后台内容管控中心

### ⚙️ 后端服务 (`backend/`)
*   **核心框架**：Spring Boot 3.2.5
*   **持久层框架**：Spring Data JPA (Hibernate)
*   **数据库版本管理**：Flyway (独立管理 DDL 增量同步)
*   **认证安全**：Spring Security + JWT + GitHub OAuth 第三方登录 + 2FA 双重因子验证 (TOTP)
*   **编译器与构建**：JDK 21 + Maven 3.x

### 🐳 运维与部署
*   **数据库**：PostgreSQL 16+
*   **缓存与回执**：Redis (连接/会话管理)
*   **容器编排**：Docker + Docker Compose
*   **流水线 CI/CD**：GitHub Actions 自动构建与部署 (ACR 阿里云镜像仓库交付)

---

## 📂 项目结构总览

项目目录采用严谨的高职责隔离设计，核心骨架如下：

```text
Butvan Blog2.0/
├── backend/                                   # ⚙️ 后端 Maven 多模块项目
│   ├── blog-parent/                           #   父 POM (依赖版本统一管理)
│   ├── blog-common/                           #   通用层 (通用组件、全局拦截、错误码、工具类)
│   ├── blog-pojo/                             #   数据模型层 (Entity/DTO/VO 定义)
│   └── blog-service/                          #   业务服务层 (Controller/Service/Repository, 程序入口)
│
├── frontend-next/                             # 🎨 ✨ 新一代极客博客前台 (Design Engineer 美学，Next.js 15 + React 19)
│   ├── src/                                   #   业务源码 (核心统一组件、五大板块、详情路由)
│   ├── docs/                                  #   组件维护手册 (COMPONENTS.md) 与架构文档
│   └── public/                                #   高保真静态资产、邮票、微视频与程序化音频
│
├── fronted/                                   # 🖥️ 原前端 Next.js 双端项目
│   ├── blog-client/                           #   原用户展示端 (房间拟真场景)
│   └── blog-admin/                            #   管理后台 (可视化编辑器、内容管控)
│
├── docx/                                      # 📝 归档文档与初始数据库设计
│   └── database/
│       └── schema.sql                         #   系统初始建表结构 (不含数据备份)
│
├── docker-compose.yml                         # 🐳 生产环境多容器一键编排配置
└── AGENTS.md                                  # 🤖 AI 智能体开发规则与开发约定
```

---

## ⚖️ 核心工程规范约定

为保证项目的长期健康维护与多人协作无冲突，所有开发必须严格遵循 [AGENTS.md](AGENTS.md) 中的硬性规范：

### 1. 数据库版本控制 (Flyway 规范)
*   **唯一源**：所有的表结构变更、索引增删、初始数据修正，**必须且仅能**通过后端迁移脚本定义。脚本目录为：`backend/blog-service/src/main/resources/db/migration`。
*   **防冲突命名**：增量 SQL 脚本命名格式强制为：`VYYYYMMDDHHMM__描述.sql`（例如 `V202607161900__add_user_avatar.sql`）。**必须是双下划线**。
*   **严禁篡改历史**：已经部署并提交过的迁移 SQL **绝对禁止直接修改**（Flyway 会进行 checksum 校验，篡改会导致启动崩溃）。如有订正，一律建一个更高版本号的 SQL 脚本文件。
*   **关闭 JPA 自动同步**：本地及线上的持久层配置中，`ddl-auto` 必须设为 `validate`（仅校验）或 `none`，杜绝 Hibernate 乱改数据库。

### 2. Git 分支管理与“双轨制”策略
项目遵循严格的受控分支研发模型：
*   **`main` 分支**：本地日常开发与集成主分支，测试通过后在此汇总。必须随时保持编译通过且可运行。
*   **`release` 分支**：线上生产环境发布的唯一受控分支。`main` 稳定后合并至 `release` 并推送远程，从而自动触发 CI/CD 镜像构建。
*   **开发分支双轨制**：
    *   **大功能/长周期需求**：必须从 `main` 拉取特性分支开发（格式：`feat/功能名`），本地测试通过后普通/Squash 合并回 `main`。
    *   **线上紧急 Bug 修复**：必须拉取修复分支（格式：`fix/缺陷名`）进行紧急热修复并合并回 `main`。
    *   **微小修改**：允许在本地 `main` 分支上直接修改和提交，避免过度工程化。

### 3. Git Commit 规范
所有提交信息必须严格遵循 Angular / Conventional Commits 规范，统一采用中文：
格式：`<type>(<scope>): <subject>`，例如：`feat(api): 后端集成Flyway进行数据库版本控制与初始化`。
*   `type` 限制：`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `revert`, `chore`。

---

## 🚀 本地快速启动

### 1. 环境准备
确保本地安装有 JDK 21、Maven 3.x、Node.js 18+、PostgreSQL 16+。

### 2. 后端服务启动
1. 导入项目到 IDE 中，配置本地 PostgreSQL 连接（在 `application-database.yml` 中配置连接地址、用户名和密码）。
2. 在数据库中手动创建初始库 `butvan_blog`。
3. 运行 `BlogServiceApplication.java` 启动类，Flyway 会自动检测已有表或自动执行 [V1.0__init_schema.sql](backend/blog-service/src/main/resources/db/migration/V1.0__init_schema.sql) 初始化表结构。

### 3. 新一代设计工程师博客前台启动 (推荐 ✨)
```bash
cd frontend-next
pnpm install
pnpm dev
```
打开浏览器访问 [http://localhost:3000](http://localhost:3000)。

### 4. 原前台用户端启动
```bash
cd fronted/blog-client
pnpm install
pnpm dev
```
打开浏览器访问 [http://localhost:3000](http://localhost:3000)。

### 5. 后台管理端启动
```bash
cd fronted/blog-admin
pnpm install
pnpm dev
```
打开浏览器访问 [http://localhost:3001](http://localhost:3001)。

---

## 🐳 线上容器化部署

系统使用 Docker Compose 部署后端、前台、后台及 Redis，PostgreSQL 由服务器独立维护。

1. 准备已有 PostgreSQL 数据库、业务账号和数据，确保数据库允许 Docker 网段访问。
2. 当前服务器使用独立维护的 PostgreSQL 18。将 `docker-compose.postgres18.yml` 同步到 `/opt/blog`，复制 `.env.example` 为 `.env` 并填入真实配置。数据库配置使用 `POSTGRES_HOST`、`POSTGRES_PORT`、`POSTGRES_DB`、`POSTGRES_USER`、`POSTGRES_PASSWORD`。默认通过 `host.docker.internal` 访问宿主机 5432 端口，容器内的 `localhost` 指向容器自身。不要在该服务器使用会额外启动 PostgreSQL 16 的独立数据库 Compose 配置。
3. 在服务器登录阿里云镜像仓库后运行：

   ```bash
   cd /opt/blog
   docker compose -f docker-compose.postgres18.yml config --quiet
   docker compose -f docker-compose.postgres18.yml pull
   docker compose -f docker-compose.postgres18.yml up -d
   docker compose -f docker-compose.postgres18.yml ps
   ```

流水线在部署时会先将仓库中的 `docker-compose.postgres18.yml` 上传至 `/opt/blog`，然后显式使用该文件更新博客容器。流水线不会自动创建或迁移 PostgreSQL；数据库仍由服务器上的独立 Compose 项目管理。旧的 `/opt/blog/data/postgres` 数据目录在确认数据迁移和备份完成前应保留。

### 自动部署 SSH 密钥

在本地终端生成专用密钥（若文件已存在，请换一个文件名，不要覆盖）：

```bash
ssh-keygen -t ed25519 -C "butvan-blog-actions" -f ~/.ssh/butvan_blog_actions -N ""
cat ~/.ssh/butvan_blog_actions.pub | ssh root@101.133.239.11 'umask 077; mkdir -p ~/.ssh; cat >> ~/.ssh/authorized_keys; chmod 700 ~/.ssh; chmod 600 ~/.ssh/authorized_keys'
ssh -o IdentitiesOnly=yes -o PasswordAuthentication=no -i ~/.ssh/butvan_blog_actions root@101.133.239.11 'whoami'
```

公钥 `.pub` 安装到服务器；私钥文件 `~/.ssh/butvan_blog_actions` 的完整内容填入仓库 Settings → Secrets and variables → Actions 的 `SERVER_SSH_KEY`。私钥不要提交到仓库或发送到聊天中。

新服务器对应 `SERVER_HOST=101.133.239.11`、`SERVER_USER=root`、`SERVER_PORT=22`。此专用密钥使用空口令，匹配当前流水线未配置 passphrase 的方式。
