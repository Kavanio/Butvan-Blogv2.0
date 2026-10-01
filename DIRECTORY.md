## 项目目录详细说明

> Butvan Blog 2.0 — 个人博客系统  
> 前端：Next.js 16 + HeroUI v3 + Tailwind v4 | 后端：Spring Boot 3.2 + JPA + PostgreSQL  
> 全部遵循大厂开发规范，分层清晰、职责单一。

```
Butvan Blog2.0/                                    # 📦 项目根目录
│
├── AGENTS.md                                      # AI 开发助手指引（技术栈、规范、工作流）
├── DIRECTORY.md                                   # 项目目录结构说明（本文件）
├── PRODUCT.md                                     # 产品迭代需求文档（v0.1 / v0.2）
├── DATA_MODEL.md                                  # 数据库模型完整设计（11模块21张表）
├── CHANGELOG.md                                   # 📝 全项目发版历史与变更日志（对标 GitHub Release）
├── version.json                                   # 📌 全项目单一事实源版本号定义
├── fWdgJuAOF.jpeg                                 # 默认「Cozy Room」场景高清背景图
├── docker-compose.yml                             # 🐳 应用及 Redis 编排，连接服务器独立维护的 PostgreSQL
├── .github/                                       # ⚙️ GitHub 自动化配置目录
│   └── workflows/
│       ├── deploy.yml                             #   GitHub Actions 自动化部署流水线
│       └── release.yml                            #   GitHub Actions 自动依据 CHANGELOG 生成美观官方 Release
├── .graphifyignore                                # 🔍 Graphify 本地提取忽略规则配置（剔除文档/媒体文件以实现免 LLM 提取）
│
├── .agents/                                       # 🤖 智能体辅助开发配置
│   ├── rules/
│   │   └── graphify.md                            #   Graphify 关联规则配置（指导 IDE 优先查询知识图谱）
│   └── workflows/
│       └── graphify.md                            #   Graphify 关联工作流配置（自动化更新图谱）
│
├── .claude/                                       # 🤖 Claude Code 配置
│   └── skills/
│       └── ui-ux-pro-max/                         #   UI/UX Pro Max 设计技能包
│           ├── SKILL.md                           #     技能说明文档
│           ├── scripts/                           #     设计引擎脚本（核心、搜索、设计系统生成）
│           └── data/                              #     设计知识库（颜色、排版、图标、UX规范、各栈模板）
│
├── design-system/                                 # 🎨 统一 UI/UX 设计系统
│   └── butvan-blog/
│       └── MASTER.md                              #   静谧深海（Quiet Deep Sea）色彩规范、排版规则、动效定义
│
├── docx/                                          # 📝 项目文档与资料
│   ├── COLORS.md                                  #   配色参考方案（9 种冷暖主题色）
│   ├── THINKING.md                                #   产品最初构想与「沉浸式房间」跳转逻辑
│   ├── wechat_login_sealed_record_refactor.md     #   微信扫码登录 Java 17/21 sealed + record 架构重构指南
│   ├── reviews/                                   #   Code Review 审查记录
│   │   └── auth-profile-code-review.md            #     个人中心（feat/auth）代码审查报告：问题清单、测试缺口、修复优先级
│   └── database/
│       ├── schema.sql                             #   完整 DDL 建表脚本（19 张表，含索引与注释，无测试数据）
│       ├── migration-v0.3.sql                     #   数据库迁移脚本 (v0.3 版本，补齐热区高度百分比字段)
│       ├── migration-v0.4.sql                     #   数据库迁移脚本 (v0.4 版本)
│       ├── migration-v0.5.sql                     #   数据库迁移脚本 (v0.5 版本，文章、分类与标签建表及初始化数据)
│       ├── migration-v0.6.sql                     #   数据库迁移脚本 (v0.6 版本，安全插入后台评论管理侧边栏菜单)
│       ├── migration-v0.7.sql                     #   数据库迁移脚本 (v0.7 版本，安全插入后台“资源管理 -> 媒体内容管理”菜单)
│       ├── migration-v0.8.sql                     #   数据库迁移脚本 (v0.8 版本，文章点赞记录管理及菜单安全配置)
│       ├── migration-v0.9.sql                     #   数据库迁移脚本 (v0.9 版本，实现 GitHub 和 2FA 安全绑定与双重认证)
│       ├── migration-v1.0-friend-link.sql          #   数据库迁移脚本 (v1.0 版本，友链表建表)
│       ├── migration-v1.0-friend-link-menu.sql     #   数据库迁移脚本 (v1.0 版本，友链管理菜单安全配置)
│       ├── migration-v1.0-friend-link-update.sql   #   数据库迁移脚本 (v1.0 版本，友链表结构更新)
│       ├── migration-v1.1-background-image.sql     #   数据库迁移脚本 (v1.1 版本，预置站点全局背景图片配置项)
│       ├── migration-v1.2-album.sql               #   数据库迁移脚本 (v1.2 版本，相册模块建表与菜单注册)
│       ├── migration-v1.3-note.sql                #   数据库迁移脚本 (v1.3 版本，手记模块建表与初始化数据)
│       ├── migration-v1.4-note-like.sql           #   数据库迁移脚本 (v1.4 版本，手记点赞记录表)
│       ├── migration-v1.5-user-management.sql     #   数据库迁移脚本 (v1.5 版本，后台侧边栏用户管理菜单)
│       └── migration-v1.6-role-author-to-user.sql #   数据库迁移脚本 (v1.6 版本，角色 AUTHOR→USER 统一迁移)
│
├── frontend-next/                             # 🎨 ✨【新一代极客博客前台】Next.js 15 + React 19 + Tailwind + Framer Motion
│   ├── package.json                           #     前端工程依赖管理（锁定 pnpm）
│   ├── next.config.mjs                        #     Next.js 配置（BFF 反向代理 /api/* 与 /uploads/*）
│   ├── tailwind.config.ts                     #     Tailwind CSS 3.4 样式与微噪点扩展配置
│   ├── tsconfig.json                          #     TypeScript 编译配置与路径别名映射 (@/*)
│   ├── docs/                                  #     📚 工程文档
│   │   ├── ARCHITECTURE.md                    #       大厂前端四层架构与容灾降级规范
│   │   └── COMPONENTS.md                      #       核心组件维护手册（Props 接口、交互 Token 与视觉分层）
│   ├── public/                                #     静态资产（高保真素材、拍立得照片、矢量邮票、贴纸）
│   │   └── images/tech/                       #       博主专属技术栈矢量徽标（Spring, Postgres, Next.js, Docker, Agent）
│   └── src/
│       ├── app/                               #     Next.js App Router 路由层
│       │   ├── page.tsx                       #       🏠 博客首页（Header/Note/Article/Photo/Friend 五大流动板块）
│       │   ├── layout.tsx                     #       全局根布局（字体加载、触觉音效驱动与胶片微噪点图层）
│       │   ├── globals.css                    #       全局样式定义（静谧冷调/暗色主题变量、滚动条与排版）
│       │   ├── article/                       #       📝 深度长文路由
│       │   │   ├── page.tsx                   #         长文归档页（即时关键字搜索 + 分类标签筛选）
│       │   │   └── [slug]/                    #         文章详情阅读器
│       │   │       ├── page.tsx               #           服务端元数据与骨架分发
│       │   │       └── ArticleDetailClient.tsx#           文章正文客户端阅读器（Markdown 渲染、点赞、树状嵌套评论）
│       │   ├── notes/                         #       💡 碎片随笔手记路由
│       │   │   ├── page.tsx                   #         手记归档页（即时搜索 + 心情标签筛选）
│       │   │   └── [slug]/                    #         手记详情
│       │   │       ├── page.tsx               #           服务端元数据
│       │   │       └── NoteDetailClient.tsx   #           轻量手记阅读器（心情/天气徽章、时间戳与点赞互动）
│       │   ├── friends/                       #       🤝 邻居友链路由
│       │   │   └── page.tsx                   #         独立全网友链天地（一键复制本站信息、在线交换申请弹窗）
│       │   └── components/photo-card/         #       🧪 组件实验室
│       │       └── page.tsx                   #         拍立得与邮票交互式相册独立效果展示页
│       ├── components/                        #     🧩 组件层
│       │   ├── ui/                            #       纯原子 UI 原语（无业务依赖）
│       │   │   ├── Badge.tsx                  #         微状态/分类彩色徽章
│       │   │   ├── NoiseOverlay.tsx           #         胶片微噪点图层
│       │   │   ├── SpringModal.tsx            #         物理阻尼弹簧模态框
│       │   │   └── TextLink.tsx               #         下划线交互文字链
│       │   ├── core/                          #       跨板块核心统一组件（统一交互语言）
│       │   │   ├── ContentRow.tsx             #         ★ 核心统一行（手记/文章通用，带哈希确定性倾角与音效）
│       │   │   ├── HaloFrame.tsx              #         ★ 双层渐变柔光相框
│       │   │   ├── PageThumb.tsx              #         悬浮微缩纸质卡片
│       │   │   ├── Stamp.tsx                  #         法式打孔齿孔邮票组件
│       │   │   └── SectionHeader.tsx          #         统一样式板块章节标题
│       │   └── modules/                       #       页面级业务板块组合
│       │       ├── HeaderSection.tsx          #         极简名片、北京时钟与扑克牌芯片组扇形回正动效
│       │       ├── NoteSection.tsx            #         碎片随笔手记列表板块
│       │       ├── ArticleSection.tsx         #         深度架构长文列表板块
│       │       ├── PhotoSection.tsx           #         1040px 突破全宽交互式照片剪贴画板（100% 对齐原版拼贴画板与打孔齿孔邮票）
│       │       ├── FriendSection.tsx          #         底部邻居友链展示与申请板块
│       │       └── CommentSection.tsx         #         树状嵌套高可靠评论系统（乐观更新）
│       ├── services/                          #     🌐 统一数据服务防腐层
│       │   ├── client.ts                      #       HttpClient 封装（超时重试、真实 IP 透传、熔断捕获）
│       │   └── index.ts                       #       领域 Service（profile, note, article, friend, photo, comment）
│       ├── constants/                         #     📦 静态常量与兜底容灾
│       │   ├── fallbacks.ts                   #       全量离线兜底数据字典（后端断开时秒级降级不崩溃）
│       │   └── site.ts                        #       站点全局元数据配置
│       ├── hooks/                             #     🪝 自定义 Hooks
│       │   ├── useClock.ts                    #       北京时间/巴黎时间高精度时钟 Hook
│       │   ├── useSound.ts                    #       触觉音效集成 Hook
│       │   └── useTheme.ts                    #       亮色/暗色主题无缝切换 Hook
│       ├── lib/                               #     🔧 核心库与多媒体驱动
│       │   ├── sound.ts                       #       基于 Web Audio API 的程序化触觉音效合成器（tick, droplet, sparkle等）
│       │   ├── i18n.tsx                       #       轻量多语言上下文
│       │   ├── utils.ts                       #       Tailwind 类名合并与通用工具
│       │   └── data.ts                        #       本地数据辅助工具
│       ├── types/                             #     📐 TypeScript 严格数据类型映射
│       │   ├── article.ts                     #       文章与标签模型
│       │   ├── note.ts                        #       随笔手记模型
│       │   ├── album.ts                       #       相册与拍立得照片模型
│       │   ├── friend.ts                      #       友链模型
│       │   ├── comment.ts                     #       树状评论模型
│       │   ├── profile.ts                     #       博主名片模型
│       │   └── api.ts                         #       统一 API 响应契约
│       └── utils/                             #     🧮 纯算法工具
│           ├── hash.ts                        #       确定性字符串哈希算法（用于生成稳定倾角）
│           ├── math.ts                        #       几何与阻尼插值数学工具
│           └── date.ts                        #       日期标准化解析工具
│
├── fronted/                                       # 🖥️【原双端前端】Next.js 16 + TypeScript + HeroUI v3 + Tailwind v4
│   │
│   ├── blog-client/                               #   用户展示端（前台博客）
│   │   ├── public/                                #     静态资源
│   │   │   ├── images/                            #       图片资源
│   │   │   └── fonts/                             #       自定义字体文件
│   │   ├── src/
│   │   │   ├── app/                               #     Next.js App Router 路由层
│   │   │   │   ├── page.tsx                       #         🏠 首页 — 房间场景：PNG图层切片物理悬浮交互、镜头缩放聚焦
│   │   │   │   ├── article/                       #       📝 文章模块
│   │   │   │   │   ├── page.tsx                   #         文章列表页（分页、多维筛选、Mock降级）
│   │   │   │   │   └── [slug]/                    #         文章详情页
│   │   │   │   │       └── page.tsx               #           正文渲染、评论、系列导航
│   │   │   │   ├── categories/                    #       📂 分类模块
│   │   │   │   │   └── [slug]/                    #         分类文章列表
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── tags/                          #       🏷️ 标签模块
│   │   │   │   │   └── [slug]/                    #         标签文章列表
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── series/                        #       📚 系列/专题模块
│   │   │   │   │   └── [slug]/                    #         系列详情（含目录导航）
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── friend/                        #       🔗 友链模块
│   │   │   │   │   ├── page.tsx                   #         友链目录页 — 「编辑式刊头」瑞士网格布局（分类水印+双栏条目+hover强调线）
│   │   │   │   │   └── apply/                     #         友链申请子路由
│   │   │   │   │       └── page.tsx               #           友链申请表单页（编辑式分栏布局+实时预览+URL自动抓取+头像上传）
│   │   │   │   ├── albums/                        #       🖼️ 相册模块
│   │   │   │   │   ├── page.tsx                   #         「暗夜画廊」相册列表页（非对称编辑式网格+IntersectionObserver入场+金色光晕交互）
│   │   │   │   │   └── [slug]/                    #         相册详情页
│   │   │   │   │   │   └── page.tsx               #           「光影长廊」视差横幅+瀑布流照片墙+弹性灯箱
│   │   │   │   ├── quotes/                        #       ✒️ 金句留言墙前台路由
│   │   │   │   │   └── page.tsx                   #         错位文字展墙、分页加载与登录投稿入口
│   │   │   │   ├── layout.tsx                     #         根布局：字体加载、全局 Metadata
│   │   │   │   ├── globals.css                    #         全局样式：静谧深海色彩变量、发光阴影
│   │   │   │   ├── providers.tsx                  #         HeroUI v3 无 Provider 兼容包装器
│   │   │   │   └── not-found.tsx                  #         自定义 404 页面
│   │   │   ├── components/                        #     🧩 组件层（按业务领域分组）
│   │   │   │   ├── auth/                          #       认证相关组件
│   │   │   │   │   ── LoginModal.tsx             #         登录弹窗（支持邮箱登录 + 微信扫码切换）
│   │   │   │   ├── common/                        #       通用原子组件（Button、Card、Modal、Empty 等）
│   │   │   │   │   ├── HtmlRenderer.tsx           #         通用 HTML 解析与组件拦截器
│   │   │   │   │   ├── MarkdownCodeBlock.tsx      #         通用定制化 macOS 风格代码块组件
│   │   │   │   │   ├── BackgroundWrapper.tsx      #         站点全局背景图片包装组件（条件渲染 body 背景）
│   │   │   │   │   ├── Navbar.tsx                 #         顶部导航栏（动态菜单 + 用户登录状态）
│   │   │   │   │   ── SidebarWidget.tsx          #         左侧悬浮侧挂栏（动态菜单 + 底部分隔线 + 登录图标）
│   │   │   │   ├── layout/                        #       布局组件
│   │   │   │   │   ├── Header.tsx                 #         全局顶栏（Logo、导航、搜索）
│   │   │   │   │   ├── Footer.tsx                 #         全局底栏（备案号、社交链接）
│   │   │   │   │   └── Navigation.tsx             #         导航菜单渲染（从 API 获取菜单树）
│   │   │   │   ├── home/                          #       首页专属组件
│   │   │   │   │   ├── RoomScene.tsx              #         房间场景容器（图层叠加、百分比定位）
│   │   │   │   │   ├── HotspotItem.tsx            #         可交互物品（PNG悬浮+发光+Tooltip）
│   │   │   │   │   └── ZoomTransition.tsx         #         镜头拉近过渡动画组件
│   │   │   │   ├── article/                       #       文章组件
│   │   │   │   │   ├── ArticleCard.tsx            #         文章卡片（列表用）
│   │   │   │   │   ├── ArticleList.tsx            #         文章列表（分页/无限滚动）
│   │   │   │   │   └── ArticleContent.tsx         #         文章正文渲染器（Markdown → HTML）
│   │   │   │   ├── comment/                       #       评论组件
│   │   │   │   │   ├── CommentSection.tsx         #         评论区容器（嵌套回复结构）
│   │   │   │   │   └── CommentForm.tsx            #         评论表单（Markdown 快捷输入）
│   │   │   │   ├── friend/                        #       友链组件
│   │   │   │   │   ├── FriendTree.tsx            #         友链大树（旧版，SVG 树骨架 + HTML 卡片叶子）
│   │   │   │   │   └── FriendLinks.tsx            #         友链目录（旧版备用列表组件）
│   │   │   │   ├── album/                         #       相册组件
│   │   │   │   │   ├── AlbumGrid.tsx              #         非对称编辑式网格（IntersectionObserver入场+封面去灰+金色光晕）
│   │   │   │   │   ├── AlbumHero.tsx              #         详情页视差横幅（毛玻璃标题叠层+滚动视差）
│   │   │   │   │   ├── PhotoLightbox.tsx          #         弹性灯箱（弹簧缩放动画+键盘导航+页码指示器）
│   │   │   │   │   └── AlbumSkeleton.tsx          #         骨架屏（列表+详情加载态占位）
│   │   │   │   ├── quote/                         #       金句墙组件
│   │   │   │   │   ├── QuoteWall.tsx              #         稳定 ID 驱动的错位文字流渲染器
│   │   │   │   │   └── QuoteSkeleton.tsx          #         无卡片文字骨架屏
│   │   │   │   └── series/                        #       系列组件
│   │   │   │       └── SeriesNavigation.tsx       #         系列目录导航（上一篇/下一篇）
│   │   │   ├── hooks/                             #     🪝 自定义 Hooks
│   │   │   │   ├── useArticles.ts                 #       文章数据请求与缓存
│   │   │   │   ├── useHotspots.ts                 #       热区数据请求与鼠标交互
│   │   │   │   └── useScrollPosition.ts           #       滚动位置监听
│   │   │   ├── lib/                               #     🔧 工具库
│   │   │   │   ├── http-client.ts                 #       统一 HTTP 请求封装（fetch 包装、超时控制、统一错误转换为 AppError）
│   │   │   │   ├── error-handler.ts               #       全局错误处理器（AppError 类、错误分类、统一 toast 提示、SSR 安全）
│   │   │   │   ├── profile.ts                     #       用户资料 API（公开资料、导航菜单）
│   │   │   │   ├── friend-api.ts                  #       友链 API（列表查询、申请、图片上传、网站元数据抓取）
│   │   │   │   ├── album-api.ts                   #       相册 API（公开列表查询、slug 相册详情）
│   │   │   │   ├── quote-api.ts                   #       金句墙已发布内容的公开查询 API
│   │   │   │   ├── api.ts                         #       Axios/fetch 封装（baseURL、拦截器、错误处理）
│   │   │   │   ├── constants.ts                   #       前端常量（站点名、分页大小等）
│   │   │   │   └── image-url.ts                   #       图片 URL 解析工具函数（支持相对路径与绝对路径）
│   │   │   ├── types/                             #     📐 TypeScript 类型定义
│   │   │   │   ├── scene.ts                       #       场景/热区类型
│   │   │   │   ├── article.ts                     #       文章/分类/标签类型
│   │   │   │   ├── album.ts                       #       相册类型（AlbumItem/AlbumPhoto/AlbumDetail）
│   │   │   │   ├── quote.ts                       #       金句墙公开分页记录类型
│   │   │   │   └── common.ts                      #       通用类型（分页、API 响应等）
│   │   │   └── styles/                            #     🎨 额外样式（Tailwind 无法覆盖的复杂样式）
│   │   ├── next.config.ts                         #     Next.js 配置（图片域名、重定向等）
│   │   ├── postcss.config.mjs                     #     PostCSS 配置
│   │   ├── tsconfig.json                          #     TypeScript 配置
│   │   ├── eslint.config.mjs                      #     ESLint 规则
│   │   ├── package.json                           #     依赖声明（next, heroui, tailwind 等）
│   │   ├── .gitignore                             #     Git 忽略规则
│   │   └── Dockerfile                             #     Next.js 独立构建 Dockerfile
│   │
│   └── blog-admin/                                #   管理后台端（内容管理）
│       ├── public/                                #     静态资源
│       │   ├── topography.svg                     #       地形图交互背景资源
│       │   ├── texture.png                        #       微粒材质贴图
│       │   └── noise.png                          #       噪点贴图
│       ├── src/
│       │   ├── app/                               #     Next.js App Router 路由层
│       │   │   ├── (auth)/                        #       🔐 认证模块（无布局壳）
│       │   │   │   └── login/                     #         登录页
│       │   │   │       └── page.tsx               #           账号密码登录表单
│       │   │   ├── (dashboard)/                   #       📊 管理后台（带侧边栏布局壳）
│       │   │   │   ├── layout.tsx                 #         后台布局：侧边栏 + 顶栏 + 内容区
│       │   │   │   ├── page.tsx                   #         仪表盘首页（一体化隔线控制台、SVG趋势图、系统负载、快捷模块）
│       │   │   │   ├── articles/                  #         文章管理
│       │   │   │   │   ├── page.tsx               #           文章列表（筛选、搜索、批量操作）
│       │   │   │   │   ├── new/                   #           新建文章
│       │   │   │   │   │   └── page.tsx           #             Markdown 编辑器 + SEO 设置
│       │   │   │   │   └── [id]/                  #           编辑文章
│       │   │   │   │       └── page.tsx           #             版本历史查看、回滚
│       │   │   │   ├── scenes/                    #         场景管理（首页房间）
│       │   │   │   │   ├── page.tsx               #           场景列表
│       │   │   │   │   └── [id]/                  #           场景热区编辑器
│       │   │   │   │       └── page.tsx           #             可视化拖拽放置 PNG、框选、属性编辑
│       │   │   │   ├── categories/                #         分类管理
│       │   │   │   │   └── page.tsx               #           分类CRUD（树形拖拽排序）
│       │   │   │   ├── tags/                      #         标签管理
│       │   │   │   │   └── page.tsx               #           标签CRUD
│       │   │   │   ├── comments/                  #         评论管理
│       │   │   │   │   └── page.tsx               #           评论审核（通过/垃圾/删除）
│       │   │   │   ├── quotes/                    #         金句墙管理
│       │   │   │   │   └── page.tsx               #           金句创建、审核、置顶、编辑和软删除
│       │   │   │   ├── media/                     #         媒体库
│       │   │   │   │   └── page.tsx               #           文件上传/预览/删除（支持图片裁剪）
│       │   │   │   ├── pages/                     #         独立页面管理
│       │   │   │   │   └── page.tsx               #           关于我/友链等页面编辑
│       │   │   │   ├── navigation/                #         导航菜单管理
│       │   │   │   │   └── page.tsx               #           多级菜单树（拖拽排序、链接配置）
│       │   │   │   ├── albums/                    #         相册管理
│       │   │   │   │   └── page.tsx               #           左栏列表+右栏照片网格（CRUD+媒体选择器+封面设置）
│       │   │   │   ├── series/                    #         系列/专题管理
│       │   │   │   │   └── page.tsx               #           系列CRUD + 文章拖入排序
│       │   │   │   ├── subscribers/               #         订阅者管理
│       │   │   │   │   └── page.tsx               #           订阅列表、邮件群发入口
│       │   │   │   ├── users/                     #         用户管理
│       │   │   │   │   └── page.tsx               #           用户列表（筛选、搜索、批量启禁用、重置密码、CRUD）
│       │   │   │   ├── system-logs/               #         系统控制台实时日志
│       │   │   │   │   └── page.tsx               #           暗黑 Terminal 实时滚屏监控页面
│       │   │   │   ├── profile/                   #         个人中心
│       │   │   │   │   └── page.tsx               #           当前账号资料、安全改密、邮箱与第三方绑定状态
│       │   │   │   └── settings/                  #         系统设置
│       │   │   │       └── page.tsx               #           站点配置、友链管理、操作日志查看
│       │   │   ├── layout.tsx                     #         全局根布局
│       │   │   ├── globals.css                    #         全局样式与自定义配色
│       │   │   └── providers.tsx                  #         HeroUI v3 兼容包装器
│       │   ├── components/                        #     🧩 组件层
│       │   │   ├── common/                        #       通用原子组件（Table、Form、Modal、Portal、Upload、ImagePreviewModal 全屏大图预览等）
│       │   │   ├── layout/                        #       后台布局组件
│       │   │   │   ├── AdminLayout.tsx            #         后台整体布局壳（侧边栏+页签栏+内容区）
│       │   │   │   ├── Sidebar.tsx                #         可折叠侧边栏菜单
│       │   │   │   ├── AccountSummary.tsx         #         侧边栏底部当前账号摘要、个人中心入口与安全登出
│       │   │   │   ├── TopBar.tsx                 #         顶栏（面包屑、全屏、深色切换、用户登出）
│       │   │   │   ├── TabManager.tsx             #         多标签页签管理器（持久化缓存、页签关闭/切换）
│       │   │   │   ├── MobileHeader.tsx           #         移动端专属顶栏（Logo、滑动菜单触发、页面标题）
│       │   │   │   └── MobileRightPanel.tsx       #         移动端右侧操作抽屉面板（用户卡片、主题、全屏、登出）
│       │   │   ├── dashboard/                     #       仪表盘与消息通知组件
│       │   │   │   └── NotificationDrawer.tsx     #         系统通知侧滑抽屉组件 (新增)
│       │   │   ├── editor/                        #       编辑器组件
│       │   │   │   ├── MarkdownEditor.tsx         #         Markdown 富文本编辑器（含 Sticky 外壳与独立滚动区）
│       │   │   │   ├── EditorToc.tsx              #         文章大纲/目录实时解析与极简树轨 Active 高亮指示器组件 (新增)
│       │   │   │   ├── ImageNodeViewComponent.tsx #         Tiptap 图片 React NodeView（支持全屏查看大图、破损卡片提示、URL展示、替换链接与重新上传）
│       │   │   │   ├── HtmlEmbedNodeView.tsx      #         Tiptap 嵌入 HTML 网页 NodeView 组件（Mac 浏览器风格外壳、文件标题、全屏/还原与嵌入沙盒渲染） (新增)
│       │   │   │   ├── InitializedMDXEditor.tsx   #         所见即所得 (WYSIWYG) 客户端编辑器组件
│       │   │   │   ├── SceneToolbar.tsx           #         场景编辑器顶部工具栏
│       │   │   │   ├── SceneCanvas.tsx            #         场景编辑器可视化画布
│       │   │   │   └── HotspotPropertiesPanel.tsx #         场景热区物品属性编辑面板
│       │   │   └── forms/                         #       表单组件（文章表单、场景表单等复合表单）
│       │   │       └── UserFormModal.tsx           #         用户创建/编辑表单弹窗组件
│       │   ├── hooks/                             #     🪝 自定义 Hooks
│       │   │   ├── useAuth.ts                     #       认证状态管理
│       │   │   └── useUpload.ts                   #       文件上传 Hook
│       │   ├── lib/                               #     🔧 工具库
│       │   │   ├── api.ts                         #       API 请求封装（自动附带 JWT Token）
│       │   │   ├── auth.ts                        #       Token 存储/刷新/过期处理
│       │   │   ├── account-api.ts                 #       当前登录账号资料、改密、个人中心相关 API 封装
│       │   │   ├── article-api.ts                 #       文章、分类、标签相关的 API 请求统一封装
│       │   │   ├── comments-api.ts                #       评论、审核、快捷回复相关的 API 请求统一封装
│       │   │   ├── quote-api.ts                   #       金句墙后台管理 API 请求封装
│       │   │   ├── album-api.ts                   #       相册管理 API（CRUD、照片添加/移除/排序）
│       │   │   ├── user-api.ts                    #       用户管理 API（CRUD、启禁用、重置密码、批量操作）
│       │   │   ├── notification-api.ts            #       系统消息通知管理 API (新增)
│       │   │   └── websocket-url.ts               #       WebSocket URL 智能解析与构建工具库 (新增)
│       │   └── types/                             #     📐 TypeScript 类型定义（与 blog-client 共享，新增 notification.ts）
│       │       └── quote.ts                        #       金句管理类型与请求结构
│       ├── next.config.ts
│       ├── postcss.config.mjs
│       ├── tsconfig.json
│       ├── eslint.config.mjs
│       ├── package.json
│       ├── .gitignore
│       └── Dockerfile                             #     Next.js 独立构建 Dockerfile
│
└── backend/                                        # ⚙️【后端】Spring Boot 3.2 + Maven 多模块 + JPA + PostgreSQL
    │
    ├── pom.xml                                     #   Maven 父工程 POM（统一依赖版本管理、模块聚合）
    ├── Dockerfile                                  #   Spring Boot 多阶段构建 Dockerfile
    ├── migration-v0.2.sql                          #   数据库迁移脚本 (v0.2 版本)
    ├── uploads/                                    #   📁 静态资源上传映射物理目录（本地测试图片存储）
    │   └── sprites/                                #     透明 PNG 热区悬浮物品切片存储目录
    │
    ├── blog-common/                                #   📦 通用基础模块（无业务依赖，被所有模块引用）
    │   ├── pom.xml                                 #     Maven 子模块 POM
    │   └── src/main/java/com/butvan/blog/common/
    │       ├── config/                             #       通用配置
    │       │   ├── WebMvcConfig.java               #         MVC 配置（CORS、拦截器、消息转换器）
    │       │   └── RedisConfig.java                #         Redis 配置（StringRedisTemplate 自动配置）
    │       ├── constant/                           #       常量定义
    │       │   └── Constants.java                  #         全局常量（日期格式、默认分页大小等）
    │       ├── properties/                         #       配置属性映射（@ConfigurationProperties）
    │       │   ├── WeiXinProperties.java           #         微信配置映射（appid / appsecret）
    │       │   ├── StorageProperties.java          #         文件存储配置映射（local / minio 切换）
    │       │   └── SecurityProperties.java         #         Security 放行路径配置（从 YAML 读取 permitAll 规则）
    │       ├── storage/                            #       文件存储抽象层（策略模式）
    │       │   └── FileStorageService.java         #         文件存储服务接口（upload / delete / getAccessUrl）
    │       ├── exception/                          #       异常定义
    │       │   ├── BaseException.java              #         全局业务异常基类（code + msg）
    │       │   └── BusinessException.java          #         具体业务异常（文章不存在、权限不足等）
    │       ├── handler/                            #       全局处理器
    │       │   └── GlobalExceptionHandler.java     #         REST 异常统一拦截（业务异常 + 参数校验异常）
    │       ├── result/                             #       统一响应体
    │       │   ├── Result.java                     #         统一 JSON 返回包装器（code + msg + data）
    │       │   └── PageResult.java                 #         分页响应体（total + page + size + records）
    │       └── utils/                              #       通用工具类
    │           ├── SlugUtils.java                  #         中文/英文转 URL Slug 工具
    │           ├── HttpUtils.java                  #         HTTP 请求工具（GET/POST，含字节数组下载）
    │           ├── RedisUtils.java                 #         Redis 工具类（String/对象/锁/计数器/Hash/List/Set）
    │           ├── MinioUtils.java                 #         MinIO 对象存储工具类（Bucket/上传/下载/删除/预签名URL）
    │           └── domain/                         #         HTTP 工具 DTO
    │               ├── HttpDto.java                #           HTTP 请求参数封装
    │               └── HttpVo.java                 #           HTTP 响应结果封装
    │
    ├── blog-pojo/                                  #   📦 数据模型模块（Entity / DTO / VO）
    │   ├── pom.xml                                 #     Maven 子模块 POM（依赖 JPA + Lombok + Jackson）
    │   └── src/main/java/com/butvan/blog/pojo/
    │       ├── entity/                             #       数据库实体（JPA @Entity，21 张表一一映射）
    │       │   ├── Scene.java                      #         blog_homepage_scene — 首页场景
    │       │   ├── Hotspot.java                    #         blog_homepage_hotspot — 交互热区/物品
    │       │   ├── User.java                       #         blog_user — 用户
    │       │   ├── Category.java                   #         blog_category — 分类
    │       │   ├── Tag.java                        #         blog_tag — 标签
    │       │   ├── Article.java                    #         blog_article — 文章
    │       │   ├── ArticleVersion.java             #         blog_article_version — 文章版本历史
    │       │   ├── Series.java                     #         blog_series — 文章系列/专题
    │       │   ├── Comment.java                    #         blog_comment — 评论
    │       │   ├── Quote.java                      #         blog_quote — 金句留言墙内容与审核记录
    │       │   ├── Media.java                      #         blog_media — 媒体资源
│       │   ├── Album.java                      #         blog_album — 相册
│       │   ├── AlbumPhoto.java                 #         blog_album_photo — 相册照片关联
    │       │   ├── Page.java                       #         blog_page — 独立页面
    │       │   ├── Navigation.java                 #         blog_navigation — 导航菜单
    │       │   ├── SiteConfig.java                 #         blog_site_config — 站点配置
    │       │   ├── FriendLink.java                 #         blog_friend_link — 友链
    │       │   ├── Subscriber.java                 #         blog_subscriber — 邮件订阅
    │       │   ├── OperationLog.java               #         blog_operation_log — 操作日志
    │       │   └── VisitLog.java                   #         blog_visit_log — 访问日志
    │       ├── dto/                                #       数据传输对象（接收前端请求体）
    │       │   ├── admin/                          #         后台管理相关：AdminCreateUserDTO, AdminUpdateUserDTO, AdminResetPasswordDTO
    │       │   ├── article/                        #         文章相关：ArticleCreateDTO, ArticleUpdateDTO, ArticleQueryDTO
    │       │   ├── comment/                        #         评论相关：CommentCreateDTO, CommentAuditDTO
    │       │   ├── quote/                          #         金句相关：QuoteSaveDTO, QuoteQueryDTO
    │       │   ├── auth/                           #         认证相关：LoginDTO, RegisterDTO, CurrentUserUpdateDTO, PasswordChangeDTO
    │       │   ├── scene/                          #         场景相关：SceneSaveDTO, HotspotSaveDTO
    │       │   ├── page/                           #         独立页相关：PageSaveDTO
    │       │   ├── site/                           #         站点配置相关：SiteConfigUpdateDTO
    │       │   ├── profile/                        #         个人资料相关：ProfileUpdateDTO
│       │   ├── album/                          #         相册相关：AlbumSaveDTO, AlbumQueryDTO, AlbumPhotoSaveDTO, AlbumPhotoSortDTO
    │       │   └── common/                         #         通用：PageQueryDTO, BatchDeleteDTO
    │       └── vo/                                 #       视图对象（返回前端展示）
    │           ├── admin/                          #         后台管理相关：AdminUserVO
    │           ├── article/                        #         文章相关：ArticleDetailVO, ArticleListVO
    │           ├── home/                           #         首页相关：HomeSceneVO, HotspotVO
    │           ├── comment/                        #         评论相关：CommentVO
    │           ├── quote/                          #         金句相关：QuoteVO, AdminQuoteVO
    │           ├── auth/                           #         认证相关：LoginVO, CurrentUserVO
    │           ├── site/                           #         站点配置相关：SiteConfigVO
    │           ├── profile/                        #         个人资料相关：ProfileVO
│           ├── album/                          #         相册相关：AlbumVO, AlbumListVO, AlbumPhotoVO
│           ├── log/                            #         日志相关：LogArchiveVO (历史日志归档包数据传输对象)
            └── common/                         #         通用：PageVO, StatisticsVO
    │
    └── blog-service/                               #   📦 主业务服务模块（启动入口 + 业务逻辑）
        ├── pom.xml                                 #     Maven 子模块 POM（依赖 blog-common + blog-pojo + Spring Boot Starter）
        └── src/
            ├── main/
            │   ├── java/com/butvan/blog/service/
            │   │   ├── BlogApplication.java        #       🚀 Spring Boot 启动类（多包扫描 + JPA 审计启用）
            │   │   ├── config/                     #       服务层配置
            │   │   │   ├── CorsConfig.java         #         CORS 跨域配置（允许前端 dev 端口）
            │   │   │   └── SwaggerConfig.java      #         Swagger/OpenAPI 文档配置
            │   │   ├── storage/                    #       文件存储实现层（策略模式）
            │   │   │   ├── LocalFileStorageService.java  #   本地磁盘存储实现
            │   │   │   └── MinioFileStorageService.java  #   MinIO 对象存储实现
            │   │   ├── controller/                 #       🌐 控制器层（REST API，仅做参数校验与路由）
            │   │   │   ├── SceneController.java    #         场景与热区 CRUD 接口（GET/POST/PUT/DELETE）
            │   │   │   ├── ArticleController.java  #         文章 CRUD + 状态变更 + 搜索接口
            │   │   │   ├── CategoryController.java #         分类管理接口
            │   │   │   ├── TagController.java      #         标签管理接口
            │   │   │   ├── CommentController.java  #         评论提交/审核/删除接口
            │   │   │   ├── QuoteController.java    #         金句公开查询、登录投稿与后台审核接口
            │   │   │   ├── MediaController.java    #         文件上传/删除接口
            │   │   │   ├── PageController.java     #         独立页面管理接口
            │   │   │   ├── NavigationController.java #       导航菜单管理接口
            │   │   │   ├── SeriesController.java   #         系列/专题管理接口
            │   │   │   ├── AuthController.java      #         登录注册、当前账号资料、个人中心资料保存与密码修改接口
            │   │   │   ├── SiteConfigController.java #       站点配置管理接口
            │   │   │   ├── FriendLinkController.java #       友链管理接口
│   │   │   ├── AdminUserController.java #     后台用户管理接口（CRUD + 启禁用 + 重置密码 + 批量操作）
│   │   │   ├── AlbumController.java       #       相册管理接口（管理端+公开端）
            │   │   │   └── SubscriberController.java #      订阅管理接口
            │   │   ├── repository/                 #       🗄️ 数据访问层（JPA Repository 接口）
            │   │   │   ├── SceneRepository.java    #         场景 Repository（查询启用场景）
            │   │   │   ├── HotspotRepository.java  #         热区 Repository（按场景查询+排序）
            │   │   │   ├── UserRepository.java     #         用户 Repository（按用户名/邮箱查询）
            │   │   │   ├── ArticleRepository.java  #         文章 Repository（按状态/分类/标签/关键字查询）
            │   │   │   ├── ArticleVersionRepository.java #   文章版本 Repository
            │   │   │   ├── CategoryRepository.java #         分类 Repository
            │   │   │   ├── TagRepository.java      #         标签 Repository
            │   │   │   ├── SeriesRepository.java   #         系列 Repository
            │   │   │   ├── CommentRepository.java  #         评论 Repository（按文章+状态查询）
            │   │   │   ├── QuoteRepository.java    #         金句 Repository（分页筛选与投稿频控统计）
            │   │   │   ├── MediaRepository.java    #         媒体 Repository
            │   │   │   ├── PageRepository.java     #         独立页 Repository（按 slug 查询）
            │   │   │   ├── NavigationRepository.java #       导航 Repository（按位置查询树形菜单）
            │   │   │   ├── SiteConfigRepository.java #       配置 Repository（按 key 查询）
            │   │   │   ├── FriendLinkRepository.java #      友链 Repository
│   │   │   ├── AlbumRepository.java      #      相册 Repository（按状态/排序查询）
│   │   │   ├── AlbumPhotoRepository.java  #      相册照片关联 Repository（按相册查询+排序）
            │   │   │   ├── SubscriberRepository.java #      订阅 Repository
            │   │   │   ├── OperationLogRepository.java #    操作日志 Repository
            │   │   │   └── VisitLogRepository.java  #       访问日志 Repository
            │   │   ├── service/                    #       💼 业务逻辑层（接口定义）
            │   │   │   ├── SceneService.java       #         场景业务接口
            │   │   │   ├── ArticleService.java     #         文章业务接口
            │   │   │   ├── CategoryService.java    #         分类业务接口
            │   │   │   ├── TagService.java         #         标签业务接口
            │   │   │   ├── CommentService.java     #         评论业务接口
            │   │   │   ├── QuoteService.java       #         金句投稿、审核、置顶与软删除业务接口
            │   │   │   ├── MediaService.java       #         媒体业务接口
            │   │   │   ├── PageService.java        #         独立页业务接口
            │   │   │   ├── NavigationService.java  #         导航业务接口
            │   │   │   ├── SeriesService.java      #         系列业务接口
            │   │   │   ├── AuthService.java         #         认证与当前账号个人中心业务接口
            │   │   │   ├── TokenService.java       #         Token 生命周期管理（双 Token 签发/刷新/吊销）
            │   │   │   ├── SiteConfigService.java  #         配置业务接口
            │   │   │   ├── FriendLinkService.java  #         友链业务接口
│   │   │   ├── AdminUserService.java #         后台用户管理业务接口
│   │   │   ├── AlbumService.java       #         相册业务接口
            │   │   │   ├── SubscriberService.java  #         订阅业务接口
            │   │   │   └── impl/                   #         业务逻辑实现层（@Service + @Transactional）
            │   │   │       ├── SceneServiceImpl.java
            │   │   │       ├── ArticleServiceImpl.java
            │   │   │       ├── CategoryServiceImpl.java
            │   │   │       ├── TagServiceImpl.java
            │   │   │       ├── CommentServiceImpl.java
            │   │   │       ├── QuoteServiceImpl.java #       金句业务实现（审核、频控、分页与 VO 转换）
            │   │   │       ├── MediaServiceImpl.java
            │   │   │       ├── PageServiceImpl.java
            │   │   │       ├── NavigationServiceImpl.java
            │   │   │       ├── SeriesServiceImpl.java
            │   │   │       ├── AuthServiceImpl.java
            │   │   │       ├── SiteConfigServiceImpl.java
            │   │   │       ├── FriendLinkServiceImpl.java
│   │   │       ├── AdminUserServiceImpl.java #   后台用户管理业务实现（含安全约束）
│   │   │       ├── AlbumServiceImpl.java
            │   │   │       └── SubscriberServiceImpl.java
            │   │   ├── weixin/                     #       📱 微信模块
            │   │   │   ├── common/
            │   │   │   │   ├── util/
            │   │   │   │   │   ├── WeiXinBaseService.java
            │   │   │   │   │   └── WeiXinBaseServiceImpl.java
            │   │   │   │   └── constant/
            │   │   │   │       └── WeiXinApiBaseUrl.java
            │   │   │   └── service/
            │   │   │       ├── WeiXinAuthLoginService.java
            │   │   │       └── impl/
            │   │   ├── event/                      #       📢 事件驱动总线
            │   │   │   └── NotificationEvents.java  #         集中管理系统通知及文章发布(ArticlePublishedEvent)事件总线
            │   │   ├── listener/                   #       👂 事件监听处理器
            │   │   │   ├── NotificationListener.java#         系统通知事件异步监听与 WebSocket 实时广播
            │   │   │   └── WechatNotificationListener.java #    微信模板消息通知监听器（事务提交后异步向关注用户批量推送）
            │   │   ├── scheduler/                  #       ⏰ 定时任务模块
            │   │   │   └── TrafficSyncScheduler.java#         每日流量访问（PV/UV）Redis 缓存数据定时同步回刷数据库调度器
            │   └── resources/                      #       配置文件与 Flyway 数据库迁移
            │       ├── db/migration/               #         Flyway 数据库同步更新源
            │       │   └── V202607291900__add_article_related_ids.sql # 文章关联推荐 ID 列表字段扩展迁移 SQL
            │       │   └── V202609021100__create_quote_wall.sql # 金句墙表、索引和动态导航注册
            │   │   ├── log/                        #       📝 日志模块
            │   │   │   └── WebConsoleAppender.java  #         自定义 Logback 系统日志 WebSocket 拦截 Appender
            │   │   └── security/                   #       🔒 安全模块
            │   │       ├── JwtAuthFilter.java      #         JWT 认证过滤器（每次请求校验 Token）
            │   │       ├── JwtUtil.java            #         JWT 工具类（签发、解析、校验 Token）
            │   │       └── SecurityConfig.java     #         Spring Security 配置（放行路径从 YAML 动态加载）
            │   └── resources/
            │       ├── application.yml             #         主配置文件（导入全部子配置文件）
            │       ├── application-database.yml    #         数据库、JPA及JWT安全证书配置文件
            │       ├── application-routes.yml      #         前台页面客户端路由映射配置文件
            │       ├── application-redis.yml       #         Redis 连接配置（Lettuce 连接池）
            │       ├── application-weixin.yml      #         微信配置（appid / appsecret）
            │       ├── application-storage.yml     #         文件存储配置（local / minio 切换）
            │       ├── application-security.yml    #         Security 放行路径配置（新增接口只需改此文件）
            │       ├── application-mail.yml        #         Mail 邮件发送 SMTP 服务器配置文件（发信账号及密钥）
            │       ├── logback-spring.xml          #         Logback 全局及 API 专用滚动归档日志配置文件 (新增)
            │       └── db/
            │           └── migration/              #         Flyway 数据库表结构变更同步迁移脚本目录 (新增)
            │               ├── V202607171000__drop_api_log.sql  # 物理表下线清理脚本
            │               ├── V202607171042__add_system_log_menu.sql  # 系统控制台实时日志菜单安全插入脚本
            │               └── V202607191835__add_daily_stats_uv.sql  # 每日流量表 blog_daily_stats 添加 uv_count 字段迁移脚本
            └── test/
                └── java/com/butvan/blog/service/   #       🧪 单元测试与集成测试
```

---

## 分层架构总览

```
┌─────────────────────────────────────────────────────────────────────┐
│                        blog-client (用户展示端)                       │
│  app/ → components/ → hooks/ → lib/api.ts → 后端 REST API           │
│  路由层    组件层      逻辑层     请求层                               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       blog-admin (管理后台端)                         │
│  app/ → components/ → hooks/ → lib/api.ts → 后端 REST API           │
│  路由层   表单/编辑器   认证逻辑   JWT 请求层                           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     blog-service (Spring Boot 主业务)                 │
│                                                                      │
│  Controller ──→ Service(接口) ──→ ServiceImpl(实现) ──→ Repository   │
│   (REST API)     (业务接口)        (@Transactional)      (JPA 数据层) │
│       │                │                  │                   │      │
│       │                └──────────────────┘                   │      │
│       │                     使用 DTO/VO 传输数据                │      │
│       │                                                       │      │
│       └───────────────────────────────────────────────────────┘      │
│                     blog-pojo (Entity / DTO / VO)                    │
│                     blog-common (异常、统一响应、工具类)              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 核心文件说明

| 文件/目录 | 层级 | 说明 |
|-----------|------|------|
| `AGENTS.md` | 根目录 | AI 开发助手指引（技术栈、规范、工作流） |
| `PRODUCT.md` | 根目录 | 产品定义及版本计划需求文档 |
| `DATA_MODEL.md` | 根目录 | 数据库模型完整设计（11 模块 21 张表、ER 图、索引） |
| `design-system/butvan-blog/MASTER.md` | 设计系统 | 静谧深海色彩规范、排版规则、发光/动效参数 |
| `docx/database/schema.sql` | 数据库 | PostgreSQL 完整 DDL（21 张表，含注释与索引） |
| `docx/database/migration-v0.3.sql` | 数据库 | PostgreSQL v0.3 迁移脚本（添加 height_percent 高度百分比字段） |
| `docx/database/migration-v0.5.sql` | 数据库 | PostgreSQL v0.5 迁移脚本（文章分类标签建表与初始数据） |
| `docx/database/migration-v0.6.sql` | 数据库 | PostgreSQL v0.6 迁移脚本（安全插入后台评论管理侧边栏菜单） |
| `docx/database/migration-v0.7.sql` | 数据库 | PostgreSQL v0.7 迁移脚本（安全插入后台“资源管理 -> 媒体内容管理”菜单） |
| `docx/database/migration-v0.9.sql` | 数据库 | PostgreSQL v0.9 迁移脚本（实现 GitHub 和 2FA 安全绑定与双重认证） |
| `docx/wechat_login_sealed_record_refactor.md` | 项目文档 | 微信扫码登录 Java 17/21 sealed + record 架构重构详细指南 |
| `frontend-next/src/app/page.tsx` | 新前台-首页 | 五大流动板块首页（Header、Note、Article、Photo、Friend） |
| `frontend-next/src/components/core/ContentRow.tsx` | 新前台-组件 | 核心统一行组件（哈希确定性倾角微缩图 + 弹簧阻尼 + 音效） |
| `frontend-next/src/components/modules/PhotoSection.tsx` | 新前台-组件 | 1040px 突破全宽交互式拍立得拼贴画板与打孔邮票集 |
| `frontend-next/src/services/client.ts` | 新前台-网络 | HttpClient 网络层（超时控制、IP 透传、离线优雅熔断兜底） |
| `frontend-next/src/constants/fallbacks.ts` | 新前台-容灾 | 全量离线兜底数据仓库（后端离线保障前台秒级降级不白屏） |
| `frontend-next/src/lib/sound.ts` | 新前台-音频 | 基于 Web Audio API 的程序化触觉反馈音效合成引擎 |
| `fronted/blog-admin/src/lib/article-api.ts` | 后台-工具 | 统一封装文章、分类、标签相关 API 请求方法 |
| `fronted/blog-client/src/app/page.tsx` | 前台-首页 | 房间场景：从 API 获取激活场景，PNG 图层叠层绝对百分比渲染、hover 物理悬空、发光避光阴影及缩放过渡 |
| `fronted/blog-client/src/components/home/RoomScene.tsx` | 前台-组件 | 多图层渲染容器，背景图+PNG物品百分比定位叠加 |
| `fronted/blog-client/src/components/common/HtmlRenderer.tsx` | 前台-组件 | 通用 HTML 虚拟 DOM 解析拦截器（回退 SSR 渲染） |
| `fronted/blog-client/src/components/common/MarkdownCodeBlock.tsx` | 前台-组件 | 通用定制化 macOS 风格代码块（复制/折叠/自适应亮暗高亮） |
| `fronted/blog-client/src/app/articles/[slug]/page.tsx` | 前台-文章 | 文章详情页（Markdown渲染、评论区、系列导航） |
| `fronted/blog-admin/src/app/(dashboard)/articles/new/page.tsx` | 后台-文章 | Markdown 编辑器 + 分类/标签/SEO 设置 |
| `fronted/blog-admin/src/app/(dashboard)/scenes/[id]/page.tsx` | 后台-场景 | 可视化热区编辑器（拖拽框选、百分比换算） |
| `fronted/blog-admin/src/components/editor/SceneCanvas.tsx` | 后台-组件 | 可视化场景编辑画布，支持拖拽移动/拉伸缩放/框选裁剪 |
| `fronted/blog-admin/src/components/editor/HotspotPropertiesPanel.tsx` | 后台-组件 | 选定热区后，展示其物品名称、坐标、跳转路径、悬浮文案等配置表单 |
| `fronted/blog-admin/src/components/editor/SceneToolbar.tsx` | 后台-组件 | 场景编辑器顶部工具栏，控制模式切换与手动物品上传 |
| `backend/blog-service/.../BlogApplication.java` | 后端-入口 | Spring Boot 启动类，JPA 多包扫描 |
| `backend/blog-common/.../GlobalExceptionHandler.java` | 后端-通用 | 全局异常统一拦截，映射为标准 Result 结构 |
| `backend/blog-common/.../Result.java` | 后端-通用 | 统一 JSON 响应体 `{code, msg, data}` |
| `backend/blog-pojo/.../entity/` | 后端-模型 | 21 个 JPA 实体类，与数据库表一一对应 |
| `backend/blog-service/.../security/JwtAuthFilter.java` | 后端-安全 | JWT 认证过滤器，每次请求校验 Token |
| `backend/blog-service/.../security/SecurityConfig.java` | 后端-安全 | Spring Security 配置，放行路径从 YAML 动态加载 |
| `backend/blog-common/.../properties/SecurityProperties.java` | 后端-通用 | Security 放行路径配置属性类，支持 `METHOD /path` 格式 |
| `backend/blog-service/.../application-security.yml` | 后端-配置 | Security 公开接口放行路径集中配置，新增接口只改此文件 |
| `.graphifyignore` | 根目录 | Graphify 排除非代码静态资源的规则配置文件（避免免 Key 模式下提取报错） |
| `.agents/rules/graphify.md` | 智能体-规则 | 指引 Antigravity IDE 助手优先通过 Graphify 知识图谱进行 codebase 分析的规则 |
| `.agents/workflows/graphify.md` | 智能体-工作流 | Graphify 知识图谱自动化检测与增量重构工作流配置 |

> **注意**：
> - 目录结构严格遵循大厂开发规范，前端按业务领域分组组件，后端按三层分层架构组织
> - 非核心文件/目录（如 `node_modules`、`.next`、`.idea`、`target` 等）已在 Git 中忽略
> - `src/` 下标记 `...` 的目录表示有更多同类文件，未逐一列出

---

*最后更新：2026-10-01*
