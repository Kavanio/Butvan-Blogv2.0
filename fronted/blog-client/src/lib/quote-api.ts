import { get } from '@/lib/http-client'
import type { QuotePageResult } from '@/types/quote'

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
