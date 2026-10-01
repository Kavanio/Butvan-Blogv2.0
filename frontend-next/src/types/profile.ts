/**
 * 用户公开档案类型
 * 对应 Java: com.butvan.blog.pojo.vo.profile.ProfileVO
 */

export interface ProfileVO {
  nickname: string;
  avatarUrl: string;
  bio: string;
  socialLinks?: Record<string, string | unknown>;
}
