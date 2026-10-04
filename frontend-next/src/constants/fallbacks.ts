import { ProfileVO } from "@/types/profile";
import { ArticleItemVO } from "@/types/article";
import { NoteItemVO } from "@/types/note";
import { PhotoVO } from "@/types/album";
import { FriendLinkVO } from "@/types/friend";

export const FALLBACK_PROFILE: ProfileVO = {
  nickname: "可梵",
  avatarUrl: "https://minio.server.butvan.top/blog2/USER_AVATAR/20260721/fbc00155-a6f0-4685-9067-fa1ab1c7356f.png",
  bio: "JAVA / Agent / VibeCoding 开发者",
  socialLinks: {
    github: "https://github.com/agent-butvan",
    email: "1973578950@qq.com",
    introLine1: "大三后端开发｜敲代码｜热爱生活",
    introLine2: "欢迎来到我的 Blog 交流学习，分享技术文章也分享生活帖子",
    techStack: [
      { src: "/images/tech/spring.svg", title: "Java & Spring Boot 3", rotate: -6 },
      { src: "/images/tech/postgres.svg", title: "PostgreSQL & JPA", rotate: -4 },
      { src: "/images/tech/nextjs.svg", title: "Next.js & React 19", rotate: 6 },
      { src: "/images/tech/docker.svg", title: "Docker & Linux", rotate: -5 },
      { src: "/images/tech/agent.svg", title: "AI Agent & LLM", rotate: -6 },
    ],
  },
};

export const FALLBACK_NOTES: NoteItemVO[] = [
  {
    id: 1,
    title: "关于设计工程学与代码手感的思考",
    slug: "design-engineering-and-craft",
    summary: "AI 能在数秒内生成正确的按钮与功能，但那些真正能被指尖感知的细节与阻尼，是无法被轻易替代的。",
    mood: "Reflective",
    publishedAt: "2026-09-28",
    viewCount: 142,
    likeCount: 23,
  },
  {
    id: 2,
    title: "全栈重构日志：从单体到轻量极客博客",
    slug: "refactoring-to-minimalist-blog",
    summary: "把注意力从复杂的过度工程收缩回文字、排版、动效与内容本身。",
    mood: "Inspired",
    publishedAt: "2026-09-15",
    viewCount: 310,
    likeCount: 45,
  },
  {
    id: 3,
    title: "为什么在 2026 年，我们依然需要纯手作的微动效",
    slug: "why-we-still-need-analog-motion",
    summary: "物理弹簧、高光流动与原生音频反馈，构成了数字世界的人文质感。",
    mood: "Thoughtful",
    publishedAt: "2026-08-30",
    viewCount: 256,
    likeCount: 38,
  },
];

export const FALLBACK_ARTICLES: ArticleItemVO[] = [
  {
    id: 101,
    title: "Designing the wait · 将等待视作设计的材料",
    slug: "designing-the-wait",
    summary: "在模型驱动时代，等待占据了交互的大部分时间。探讨延迟的心理学与状态反馈体系。",
    publishedAt: "2026-09-21",
    viewCount: 1280,
    likeCount: 96,
    isPinned: true,
    categoryName: "Design Engineering",
  },
  {
    id: 102,
    title: "Spring Boot 与 Next.js 极客架构实战指南",
    slug: "spring-boot-nextjs-architecture",
    summary: "前后端分离下的类型安全、SSR 优化与极致响应速度架构落地。",
    publishedAt: "2026-08-18",
    viewCount: 890,
    likeCount: 64,
    categoryName: "Full Stack",
  },
  {
    id: 103,
    title: "Web Audio API 声音合成在现代 Web 交互中的应用",
    slug: "web-audio-api-sound-synthesis",
    summary: "零外部音频依赖，纯代码实时数学合成 16 种高质感 UI 交互音效。",
    publishedAt: "2026-07-22",
    viewCount: 640,
    likeCount: 52,
    categoryName: "Audio Engineering",
  },
];

export const FALLBACK_PHOTOS: PhotoVO[] = [
  {
    id: 10,
    url: "https://minio.server.butvan.top/blog2/ALBUM/20260725/390577e7-51b0-4c84-a13a-736100489eac.png",
    caption: "生活随拍",
    albumTitle: "随拍",
    albumSlug: "随拍",
    createdAt: "2026-07-25T15:23:38.968714",
  },
];

export const FALLBACK_FRIENDS: FriendLinkVO[] = [
  {
    id: 1,
    name: "Artefact Global",
    url: "https://www.artefact.com",
    avatarUrl: "/images/logos/sephora.png",
    description: "Data & AI Consulting, leading product thinking in Europe.",
  },
  {
    id: 2,
    name: "Chloé Maillot",
    url: "https://chloemaillot.fr",
    avatarUrl: "https://minio.server.butvan.top/blog2/USER_AVATAR/20260721/fbc00155-a6f0-4685-9067-fa1ab1c7356f.png",
    description: "Design Engineer based in Paris. Ships what she designs.",
  },
  {
    id: 3,
    name: "Next.js Lab",
    url: "https://nextjs.org",
    avatarUrl: "https://minio.server.butvan.top/blog2/USER_AVATAR/20260721/fbc00155-a6f0-4685-9067-fa1ab1c7356f.png",
    description: "The React Framework for the Web. Performance and typography.",
  },
];


