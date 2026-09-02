/** 金句审核状态。 */
export type QuoteStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

/** 金句墙展示字号。 */
export type QuoteDisplaySize = 'SMALL' | 'MEDIUM' | 'LARGE'

/** 后台金句管理记录。 */
export interface AdminQuoteItem {
  id: number
  content: string
  authorName: string
  source?: string | null
  displaySize: QuoteDisplaySize
  status: QuoteStatus
  isPinned: boolean
  sortOrder: number
  userId?: number | null
  userNickname?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  createdAt: string
  updatedAt: string
}

/** 后台金句查询条件。 */
export interface QuoteQuery {
  page: number
  size: number
  keyword?: string
  status?: QuoteStatus
}

/** 后台创建或更新金句的请求体。 */
export interface QuoteSavePayload {
  content: string
  authorName: string
  source?: string
  displaySize: QuoteDisplaySize
  status: QuoteStatus
  isPinned: boolean
  sortOrder: number
}
