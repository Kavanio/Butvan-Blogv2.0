/**
 * 文章业务模型
 * 对应 Java: ArticleItemVO & ArticleDetailVO
 */

export interface TagItem {
  id: number;
  name: string;
  slug: string;
}

export interface ArticleItemVO {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  coverImageUrl?: string;
  publishedAt: string;
  viewCount?: number;
  likeCount?: number;
  isPinned?: boolean;
  isFeatured?: boolean;
  categoryId?: number;
  categoryName?: string;
  tags?: TagItem[];
  tagNames?: string[];
  wordCount?: number;
  readTime?: number;
  readingTime?: number;
}

export interface ArticleDetailVO extends ArticleItemVO {
  content: string;
  contentHtml?: string;
  isAllowComment?: boolean;
  tagNames?: string[];
}

export interface ArticleQueryDTO {
  page?: number;
  size?: number;
  keyword?: string;
  categoryId?: number;
  tagId?: number;
  status?: string;
}
