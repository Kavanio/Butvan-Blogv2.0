/**
 * 金句（Quote）业务实体与传输对象类型定义
 * 与后端 QuoteVO / PageResult 严格对应
 */

/**
 * 前台金句展示视图实体
 */
export interface QuoteItemVO {
  /** 金句唯一标识 */
  id: number;
  /** 金句正文内容 */
  content: string;
  /** 展示署名 / 作者 */
  authorName: string;
  /** 可选来源 / 出处书籍 / 作品 */
  source?: string | null;
  /** 排版视觉字号（SMALL | MEDIUM | LARGE） */
  displaySize?: "SMALL" | "MEDIUM" | "LARGE" | string;
  /** 是否置顶金句 */
  isPinned?: boolean;
  /** 创建时间（ISO 格式字符串） */
  createdAt?: string;
}

/**
 * 前台金句分页查询参数 DTO
 */
export interface QuoteQueryDTO {
  /** 当前页码（1 起始） */
  page?: number;
  /** 每页条数 */
  size?: number;
  /** 检索关键字（可选） */
  keyword?: string;
}
