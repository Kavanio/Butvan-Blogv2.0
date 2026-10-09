export interface CommentVO {
  id: number;
  articleId?: number;
  noteId?: number;
  parentId?: number | null;
  userId?: number | null;
  nickname: string;
  avatarUrl?: string;
  visitorWebsite?: string;
  content: string;
  likeCount?: number;
  isAuthorReplied?: boolean;
  isAuthor?: boolean;
  isPinned?: boolean;
  replyTo?: string | null;
  status?: string;
  articleTitle?: string;
  articleSlug?: string;
  noteTitle?: string;
  noteSlug?: string;
  createdAt: string;
  visitorEmail?: string;
  replies?: CommentVO[];
}

export interface CommentCreateDTO {
  parentId?: number | null;
  visitorName: string;
  visitorEmail: string;
  visitorWebsite?: string;
  content: string;
}
