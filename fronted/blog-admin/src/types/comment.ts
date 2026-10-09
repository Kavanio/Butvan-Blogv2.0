import type { CommentStatus } from "./common";

/**
 * 评论实体视图数据模型
 */
export interface CommentItem {
  id: number;
  articleId?: number | null;
  noteId?: number | null;
  noteTitle?: string | null;
  noteSlug?: string | null;
  parentId?: number | null;
  userId?: number | null;
  nickname: string;
  avatarUrl: string;
  visitorWebsite?: string | null;
  content: string;
  likeCount: number;
  isAuthorReplied: boolean;
  replyTo?: string | null;
  status: CommentStatus;
  visitorEmail?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  articleTitle?: string | null;
  articleSlug?: string | null;
  createdAt: string;
  isAuthor?: boolean;
  isPinned?: boolean;
}

/**
 * 后台评论分页查询参数
 */
export interface CommentQuery {
  page: number;
  size: number;
  status?: string;
  keyword?: string;
}
