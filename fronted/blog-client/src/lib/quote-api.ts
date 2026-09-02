import { get, post } from '@/lib/http-client'
import type { QuoteCreatePayload, QuoteItem, QuotePageResult } from '@/types/quote'

/**
 * 分页加载前台已审核通过的金句。
 *
 * @param page 页码，1 起始
 * @param size 每页大小
 * @returns 金句分页数据
 */
export function fetchPublicQuotes(page = 1, size = 12): Promise<QuotePageResult> {
  return get<QuotePageResult>(`/quotes?page=${page}&size=${size}`)
}

/**
 * 登录用户提交一条待审核的金句留言。
 *
 * @param payload 投稿内容
 * @returns 新建的金句记录
 */
export function createQuote(payload: QuoteCreatePayload): Promise<QuoteItem> {
  return post<QuoteItem>('/quotes', {
    content: payload.content,
    authorName: payload.authorName,
    source: payload.source,
  })
}
