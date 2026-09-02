/** 金句墙的前台展示记录。 */
export interface QuoteItem {
  id: number
  content: string
  authorName: string
  source?: string | null
  displaySize: 'SMALL' | 'MEDIUM' | 'LARGE'
  isPinned: boolean
  createdAt: string
}

/** 金句墙前台分页响应。 */
export interface QuotePageResult {
  total: number
  page: number
  size: number
  records: QuoteItem[]
}

/** 登录用户投递金句的请求体。 */
export interface QuoteCreatePayload {
  content: string
  authorName?: string
  source?: string
}
