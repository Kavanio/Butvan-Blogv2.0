/**
 * 首页技术栈微徽标
 */
export interface TechBadge {
  /** 徽标图标地址（相对路径 /uploads/... 或网络绝对路径，或预设 /images/tech/...） */
  src: string;
  /** 悬浮显示的提示标题（如 Docker & Linux, Next.js & React 19 等） */
  title: string;
  /** 扑克牌层叠微倾斜角度（deg），如 -6, 4 等 */
  rotate?: number;
  /** 点击后跳转的目标链接（可选，未配置则点击不跳转） */
  link?: string;
}

/**
 * 社交网络及个性化扩展配置
 */
export interface ProfileSocialLinks {
  introLine1?: string;
  introLine2?: string;
  github?: string;
  email?: string;
  x?: string;
  twitter?: string;
  rewardCodeUrl?: string;
  techStack?: TechBadge[];
  [key: string]: unknown;
}

/**
 * 用户公开档案类型
 * 对应 Java: com.butvan.blog.pojo.vo.profile.ProfileVO
 */
export interface ProfileVO {
  nickname: string;
  avatarUrl: string;
  bio: string;
  socialLinks?: ProfileSocialLinks;
}

