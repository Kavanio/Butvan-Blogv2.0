# 核心组件维护手册 (Core Components Documentation)

本文档面向后续开发与迭代维护人员，详细记录了本项目核心封装组件的设计理念、TypeScript Props 接口规范、设计 Token 及使用场景。

---

## 1. 目录架构与设计分层

```
src/components/
├── ui/              # 纯原子级 UI 原语（无业务依赖，高复用）
│   ├── Badge.tsx         # 微标签（状态/分类）
│   ├── NoiseOverlay.tsx  # 胶片微噪点图层
│   ├── SpringModal.tsx   # 物理弹簧模态框
│   └── TextLink.tsx      # 下划线交互文字链
├── core/            # 领域核心跨模块组件（承载核心微交互与视觉语言）
│   ├── ContentRow.tsx    # ★ 核心统一行（手记/文章通用）
│   ├── HaloFrame.tsx     # ★ 双层渐变光晕相框
│   ├── PageThumb.tsx     # 悬浮微缩纸质卡片
│   ├── Stamp.tsx         # 物理打孔邮票
│   └── SectionHeader.tsx # 统一样式板块标题
└── modules/         # 页面级业务板块组合
    ├── HeaderSection.tsx # 头部名片、北京时钟与 Spotify 播放器
    ├── NoteSection.tsx   # 手记列表板块
    ├── ArticleSection.tsx# 深度长文板块
    ├── PhotoSection.tsx  # 1040px 溢出相册流
    ├── FriendSection.tsx # 底部友链板块
    └── CommentSection.tsx# 树状嵌套评论系统
```

---

## 2. 核心组件详解与使用规范

### 2.1 ContentRow (核心列表行组件)

`ContentRow` 是整个博客最重要的信息载体，用于承载手记（Notes）和长文（Articles）。统一抹平了手记与文章的排版差异，并集成了物理阻尼动效、确定性哈希倾角和纸质微缩图。

#### Props 规范

```typescript
export interface ContentRowProps {
  title: string;              // 内容标题
  date?: string;               // 格式化日期字符串（如 "2026.03.28"）
  badge?: string;              // 徽章文字（分类/心情）
  badgeTone?: "pink" | "gray" | "emerald"; // 徽章色系
  href: string;                // 跳转路由或外链
  target?: string;             // "_blank" | undefined
  thumb?: string;              // 悬浮微缩图图片 URL（如为文章封面）
  variant?: "default" | "external"; // 链接类型：内链右箭头 / 外链斜角箭头
  className?: string;
}
```

#### 设计特性与交互 Token
- **确定性倾斜**：悬浮微缩图时，通过 `hash(title) % 7 - 3` 动态生成固定的 `-3deg ~ +3deg` 随机感倾角，保证视觉生动而不乱跳。
- **声音反馈**：在 `onMouseEnter` 时触发轻微 `playTick()` 音效。
- **弹簧阻尼**：悬浮标题右移 `x: 3`，物理弹簧阻尼系数 `stiffness: 400, damping: 25`。

#### 使用示例

```tsx
<ContentRow
  title="如何构建具备触觉反馈的前端系统"
  date="2026.03.20"
  badge="工程架构"
  badgeTone="pink"
  href="/article/design-tactile-system"
  thumb="/covers/tactile.png"
/>
```

---

### 2.2 HaloFrame (双层渐变光晕相框)

用于承载照片相册流、作者名片与重要视觉资产。

#### Props 规范

```typescript
interface HaloFrameProps {
  children: React.ReactNode;
  tiltAngle?: number;          // 静态倾斜角度（度数）
  aspectRatio?: "square" | "portrait" | "landscape" | "auto";
  outerPadding?: string;       // 光晕扩散外边距
  className?: string;
}
```

#### 视觉分层原理
1. **底层光晕 (`Outer Ambient Halo`)**：`blur-2xl opacity-40 scale-105` 柔光辐射。
2. **中层相框 (`Inner Crisp Border`)**：双层微边框 `ring-1 ring-black/5 dark:ring-white/10` 模拟物理卡纸内衬。
3. **顶层内容 (`Media Surface`)**：带有 `overflow-hidden rounded-2xl` 的图片或多媒体。

#### 使用示例

```tsx
<HaloFrame tiltAngle={-1.5} aspectRatio="landscape">
  <img src="/photo-1.jpg" alt="Kyoto memory" className="w-full h-full object-cover" />
</HaloFrame>
```

---

### 2.3 SectionHeader (板块标题)

用于每个内容区块的头部，保持全站节奏的一致性。

#### Props 规范

```typescript
interface SectionHeaderProps {
  title: string;          // 英文或主标题（如 "Note", "Article", "Friend"）
  subTitle?: string;      // 中文辅助说明（如 "碎片想法与灵感"）
  count?: number;         // 数量计数标
  actionHref?: string;    // 右侧“查看全部”的链接地址
  actionLabel?: string;   // 右侧链接文本，默认 "View all"
  className?: string;
}
```

#### 使用示例

```tsx
<SectionHeader
  title="Article"
  subTitle="深度思考与架构沉淀"
  count={articles.length}
  actionHref="/article"
  actionLabel="All Articles →"
/>
```

---

### 2.4 SpringModal (物理弹性模态框)

封装基于 Framer Motion `spring` 阻尼算法的弹窗，带有高斯毛玻璃遮罩和声音反馈。

#### Props 规范

```typescript
interface SpringModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;      // 默认 "max-w-lg"
}
```

#### 特性
- 按 `Escape` 键自动监听关闭。
- 打开时触发 `playDroplet()`，关闭时触发 `playRelease()`。
- 背景图层支持点击空白退出。

---

### 2.5 Stamp (矢量物理打孔邮票)

纯数学计算 SVG 齿孔路径的真实邮票组件，位于照片相册的角落。

#### 核心原理
通过贝塞尔曲线和半圆弧 `A` 命令在四边均匀打孔：
```typescript
generateStampPerforationPath(width, height, holeRadius, holeSpacing)
```
支持自适应父级容器宽高，营造出复古信件与旅行手帐的精致质感。

---

## 3. 音效系统 (Audio Tactile System)

位于 `src/lib/sound.ts` 与 `src/hooks/useSound.ts`，基于 Web Audio API 纯程序化振荡器合成：

| 触发器名称 | 振荡器类型 | 频率曲线 | 推荐使用场景 |
| :--- | :--- | :--- | :--- |
| `playTick` | sine / highpass | 1200Hz → 300Hz (0.015s) | 列表行悬浮、微型标签悬浮 |
| `playDroplet`| sine | 800Hz → 1400Hz (0.05s) | 链接点击、卡片展开、模态框打开 |
| `playRelease`| sine | 900Hz → 400Hz (0.04s) | 弹窗关闭、取消交互 |
| `playSparkle`| triangle | 1800Hz → 3200Hz (0.08s) | 点赞、收藏、心动微动效 |
| `playSuccess`| chord (C-E-G) | 523Hz + 659Hz + 783Hz | 评论发表成功、友链申请提交 |

---

## 4. 样式 Token 规范

本项目严格复刻 Chloé Maillot 的微像素规范：
- **最大内容容器宽度**：`max-w-[40.5rem]` (严格 648px)
- **溢出全屏相册宽度**：`max-w-[1040px]` (突破两端)
- **行高体系**：`leading-snug (1.375)` 用于标题，`leading-relaxed (1.625)` 用于正文
- **高对比色彩系统**：
  - Light 模式：主背景 `#ffffff`，正文 `#202020`，次要 `#6d6d6d`
  - Dark 模式：主背景 `#0d0d0d`，正文 `#f3f3f3`，次要 `#a2a2a2`
  - 重点粉彩选中文本高亮：Light `#fde3ef` / `#9b3860`；Dark `#462134` / `#f2aed0`
