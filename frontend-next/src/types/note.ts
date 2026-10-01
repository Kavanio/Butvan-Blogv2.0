/**
 * 随笔手记业务模型
 * 对应 Java: NoteItemVO & NoteDetailVO
 */

export interface NoteItemVO {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  mood?: string;
  weather?: string;
  location?: string;
  coverImageUrl?: string;
  publishedAt: string;
  viewCount?: number;
  likeCount?: number;
}

export interface NoteDetailVO extends NoteItemVO {
  content: string;
}

export interface NoteQueryDTO {
  page?: number;
  size?: number;
  mood?: string;
}
