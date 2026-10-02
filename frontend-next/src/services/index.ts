/**
 * 业务服务聚合导出（集成离线兜底降级策略）
 */

import { http } from "./client";
import { ProfileVO } from "@/types/profile";
import { ArticleItemVO, ArticleDetailVO, ArticleQueryDTO } from "@/types/article";
import { NoteItemVO, NoteDetailVO, NoteQueryDTO } from "@/types/note";
import { PhotoVO } from "@/types/album";
import { FriendLinkVO, FriendLinkApplyDTO } from "@/types/friend";
import { CommentVO, CommentCreateDTO } from "@/types/comment";
import { PageResult } from "@/types/api";
import {
  FALLBACK_PROFILE,
  FALLBACK_NOTES,
  FALLBACK_ARTICLES,
  FALLBACK_PHOTOS,
  FALLBACK_FRIENDS,
} from "@/constants/fallbacks";

export const profileService = {
  async getProfile(username = "butvan"): Promise<ProfileVO> {
    try {
      const data = await http.get<ProfileVO>(`/profile/public/${username}`);
      return data || FALLBACK_PROFILE;
    } catch {
      return FALLBACK_PROFILE;
    }
  },
};

export const noteService = {
  async getPublicNotes(query?: NoteQueryDTO): Promise<NoteItemVO[]> {
    try {
      const params = new URLSearchParams();
      params.append("page", String(query?.page || 1));
      params.append("size", String(query?.size || 10));
      if (query?.mood) params.append("mood", query.mood);

      const res = await http.get<PageResult<NoteItemVO>>(`/notes?${params.toString()}`);
      return res?.records || FALLBACK_NOTES;
    } catch {
      return FALLBACK_NOTES;
    }
  },

  async getDetail(slug: string): Promise<NoteDetailVO | null> {
    try {
      return await http.get<NoteDetailVO>(`/notes/${slug}`);
    } catch {
      const found = FALLBACK_NOTES.find((n) => n.slug === slug);
      if (found) {
        return {
          ...found,
          content: `# ${found.title}\n\n${found.summary}\n\n这是离线演示状态下的随笔内容。`,
        };
      }
      return null;
    }
  },

  async like(id: number): Promise<number> {
    try {
      return await http.post<number>(`/notes/${id}/like`);
    } catch {
      return 1;
    }
  },
};

export const articleService = {
  async getPublicArticles(query?: ArticleQueryDTO): Promise<ArticleItemVO[]> {
    try {
      const params = new URLSearchParams();
      params.append("page", String(query?.page || 1));
      params.append("size", String(query?.size || 10));
      if (query?.keyword) params.append("keyword", query.keyword);
      if (query?.categoryId) params.append("categoryId", String(query.categoryId));
      if (query?.tagId) params.append("tagId", String(query.tagId));

      const res = await http.get<PageResult<ArticleItemVO>>(`/articles?${params.toString()}`);
      return res?.records || FALLBACK_ARTICLES;
    } catch {
      return FALLBACK_ARTICLES;
    }
  },

  async getDetail(idOrSlug: string): Promise<ArticleDetailVO | null> {
    try {
      return await http.get<ArticleDetailVO>(`/articles/${idOrSlug}`);
    } catch {
      const found = FALLBACK_ARTICLES.find(
        (a) => a.slug === idOrSlug || String(a.id) === idOrSlug
      );
      if (found) {
        return {
          ...found,
          content: `# ${found.title}\n\n> ${found.summary}\n\n## 背景与设计哲学\n\n在现代界面工程中，动效和声音并不是装饰品，而是信息传达的重要触觉通道。\n\n\`\`\`typescript\n// 示例：程序化音频合成\nexport function playSound(type: string) {\n  const ctx = new AudioContext();\n  // ...\n}\n\`\`\`\n\n更多精彩内容正在持续沉淀。`,
        };
      }
      return null;
    }
  },

  async like(id: number): Promise<number> {
    try {
      return await http.post<number>(`/articles/${id}/like`);
    } catch {
      return 1;
    }
  },
};

export const albumService = {
  /**
   * 分页获取公开相册照片（时间线照片墙）
   * 100% 真实数据驱动，不再向前端回退死数据
   */
  async getPublicPhotos(page = 1, size = 18): Promise<PhotoVO[]> {
    try {
      const res = await http.get<PageResult<any>>(
        `/public/photos?page=${page}&size=${size}`
      );
      if (res && Array.isArray(res.records)) {
        return res.records.map((item: any) => ({
          id: item.id,
          url: item.fileUrl || item.url || "",
          thumbnailUrl: item.fileUrl || item.thumbnailUrl || item.url || "",
          caption: item.caption || item.albumTitle || "",
          albumTitle: item.albumTitle || "随拍",
          albumSlug: item.albumSlug || "",
          createdAt: item.createdAt,
          width: item.width,
          height: item.height,
        }));
      }
      return [];
    } catch (err) {
      console.warn("获取公开相册照片失败:", err);
      return [];
    }
  },
};

export const friendService = {
  async getApprovedFriends(): Promise<FriendLinkVO[]> {
    try {
      const res = await http.get<FriendLinkVO[]>(`/friends`);
      return res?.length ? res : FALLBACK_FRIENDS;
    } catch {
      return FALLBACK_FRIENDS;
    }
  },

  async apply(dto: FriendLinkApplyDTO): Promise<void> {
    await http.post<void>(`/friends/apply`, dto);
  },
};

export const commentService = {
  async getComments(articleId: number): Promise<CommentVO[]> {
    try {
      return await http.get<CommentVO[]>(`/articles/${articleId}/comments`);
    } catch {
      return [];
    }
  },

  async createComment(articleId: number, dto: CommentCreateDTO): Promise<CommentVO> {
    return await http.post<CommentVO>(`/articles/${articleId}/comments`, dto);
  },

  async likeComment(commentId: number): Promise<void> {
    try {
      await http.post<void>(`/comments/${commentId}/like`);
    } catch {
      // ignore
    }
  },
};
