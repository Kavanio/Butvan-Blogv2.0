/**
 * 友链与评论业务模型
 */

export interface FriendLinkVO {
  id: number;
  name: string;
  url: string;
  avatarUrl?: string;
  description?: string;
  category?: string;
}

export interface FriendLinkApplyDTO {
  name: string;
  url: string;
  avatarUrl: string;
  description: string;
  email: string;
  category?: string;
  remark?: string;
}

export interface WebMetaVO {
  title: string;
  description: string;
  faviconUrl: string;
  domain: string;
  success: boolean;
  errorMsg?: string;
}

export interface CommentVO {
  id: number;
  articleId: number;
  visitorName: string;
  visitorEmail?: string;
  visitorUrl?: string;
  avatarUrl?: string;
  content: string;
  createdAt: string;
  likeCount?: number;
  replyCount?: number;
  parentId?: number;
  replyToName?: string;
  children?: CommentVO[];
}

export interface CommentCreateDTO {
  visitorName: string;
  visitorEmail: string;
  visitorUrl?: string;
  content: string;
  parentId?: number;
}
