import apiClient from '@/lib/api'
import type { ApiResponse, PageResult } from '@/types/common'
import type { AdminQuoteItem, QuoteQuery, QuoteSavePayload, QuoteStatus } from '@/types/quote'

/**
 * 后台分页获取金句留言。
 *
 * @param query 筛选条件
 * @returns 分页后的金句数据
 */
export async function fetchAdminQuotes(query: QuoteQuery): Promise<PageResult<AdminQuoteItem>> {
  const response = await apiClient.get<ApiResponse<PageResult<AdminQuoteItem>>>('/admin/quotes', { params: query })
  return response.data.data
}

/**
 * 后台新建金句。
 *
 * @param payload 金句内容与展示配置
 * @returns 保存后的金句记录
 */
export async function createAdminQuote(payload: QuoteSavePayload): Promise<AdminQuoteItem> {
  const response = await apiClient.post<ApiResponse<AdminQuoteItem>>('/admin/quotes', payload)
  return response.data.data
}

/**
 * 后台更新金句。
 *
 * @param id 金句主键
 * @param payload 金句内容与展示配置
 * @returns 更新后的金句记录
 */
export async function updateAdminQuote(id: number, payload: QuoteSavePayload): Promise<AdminQuoteItem> {
  const response = await apiClient.put<ApiResponse<AdminQuoteItem>>(`/admin/quotes/${id}`, payload)
  return response.data.data
}

/**
 * 后台更新金句审核状态。
 *
 * @param id 金句主键
 * @param status 审核状态
 */
export async function updateAdminQuoteStatus(id: number, status: QuoteStatus): Promise<void> {
  await apiClient.put(`/admin/quotes/${id}/status`, { status })
}

/**
 * 后台切换金句置顶状态。
 *
 * @param id 金句主键
 */
export async function toggleAdminQuotePin(id: number): Promise<void> {
  await apiClient.put(`/admin/quotes/${id}/pin`)
}

/**
 * 后台软删除金句。
 *
 * @param id 金句主键
 */
export async function deleteAdminQuote(id: number): Promise<void> {
  await apiClient.delete(`/admin/quotes/${id}`)
}
