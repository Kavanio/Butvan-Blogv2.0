'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, LoaderCircle, Pin, Plus, Search, Trash2, X } from 'lucide-react'
import { cn } from '@heroui/react'
import ConfirmModal from '@/components/common/ConfirmModal'
import { createAdminQuote, deleteAdminQuote, fetchAdminQuotes, toggleAdminQuotePin, updateAdminQuote, updateAdminQuoteStatus } from '@/lib/quote-api'
import { toast } from '@/lib/toast'
import type { AdminQuoteItem, QuoteDisplaySize, QuoteSavePayload, QuoteStatus } from '@/types/quote'

const PAGE_SIZE = 12

const STATUS_OPTIONS: Array<{ value: '' | QuoteStatus; label: string }> = [
  { value: '', label: '全部' },
  { value: 'PENDING', label: '待审核' },
  { value: 'APPROVED', label: '已发布' },
  { value: 'REJECTED', label: '已拒绝' },
]

const EMPTY_FORM: QuoteSavePayload = {
  content: '',
  authorName: '可梵',
  source: '',
  displaySize: 'MEDIUM',
  status: 'APPROVED',
  isPinned: false,
  sortOrder: 0,
}

/**
 * 格式化后台列表时间。
 *
 * @param value ISO 时间
 * @returns 友好的本地时间
 */
function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

/**
 * 将金句记录映射为右侧编辑表单的初始值。
 *
 * @param quote 待编辑记录
 * @returns 可提交的表单数据
 */
function toForm(quote: AdminQuoteItem): QuoteSavePayload {
  return {
    content: quote.content,
    authorName: quote.authorName,
    source: quote.source || '',
    displaySize: quote.displaySize,
    status: quote.status,
    isPinned: quote.isPinned,
    sortOrder: quote.sortOrder,
  }
}

/**
 * 从未知请求错误中提取可读提示。
 *
 * @param error 请求异常
 * @param fallback 兜底文案
 * @returns 用户可见错误文案
 */
function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message
  }
  return fallback
}

/**
 * 金句墙后台审核与内容编辑页面。
 */
export default function QuotesManagementPage() {
  const [quotes, setQuotes] = useState<AdminQuoteItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<'' | QuoteStatus>('')
  const [keywordInput, setKeywordInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [actionId, setActionId] = useState<number | null>(null)
  const [selectedQuote, setSelectedQuote] = useState<AdminQuoteItem | null>(null)
  const [form, setForm] = useState<QuoteSavePayload>(EMPTY_FORM)
  const [deleteTarget, setDeleteTarget] = useState<AdminQuoteItem | null>(null)

  /**
   * 加载当前筛选条件下的金句列表。
   */
  const loadQuotes = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchAdminQuotes({
        page,
        size: PAGE_SIZE,
        keyword: keyword || undefined,
        status: status || undefined,
      })
      setQuotes(data.records || [])
      setTotal(data.total || 0)
    } catch (error) {
      toast.error(getErrorMessage(error, '加载金句列表失败'))
    } finally {
      setLoading(false)
    }
  }, [keyword, page, status])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadQuotes()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [loadQuotes])

  /**
   * 打开新建状态的编辑器。
   */
  const handleCreate = () => {
    setSelectedQuote(null)
    setForm(EMPTY_FORM)
  }

  /**
   * 将指定记录载入编辑器。
   */
  const handleSelect = (quote: AdminQuoteItem) => {
    setSelectedQuote(quote)
    setForm(toForm(quote))
  }

  /**
   * 提交搜索并回到第一页。
   */
  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPage(1)
    setKeyword(keywordInput.trim())
  }

  /**
   * 修改审核状态并刷新当前列表。
   */
  const handleStatusChange = async (quote: AdminQuoteItem, targetStatus: QuoteStatus) => {
    setActionId(quote.id)
    try {
      await updateAdminQuoteStatus(quote.id, targetStatus)
      toast.success(targetStatus === 'APPROVED' ? '金句已发布' : '金句已标记为拒绝')
      if (selectedQuote?.id === quote.id) {
        setSelectedQuote({ ...quote, status: targetStatus })
        setForm((previous) => ({ ...previous, status: targetStatus }))
      }
      await loadQuotes()
    } catch (error) {
      toast.error(getErrorMessage(error, '更新审核状态失败'))
    } finally {
      setActionId(null)
    }
  }

  /**
   * 切换金句置顶状态并刷新列表。
   */
  const handleTogglePin = async (quote: AdminQuoteItem) => {
    setActionId(quote.id)
    try {
      await toggleAdminQuotePin(quote.id)
      toast.success(quote.isPinned ? '已取消置顶' : '已置顶金句')
      await loadQuotes()
    } catch (error) {
      toast.error(getErrorMessage(error, '更新置顶状态失败'))
    } finally {
      setActionId(null)
    }
  }

  /**
   * 保存新建或编辑的金句。
   */
  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.content.trim() || !form.authorName.trim()) {
      toast.warning('请填写金句内容和展示署名')
      return
    }
    setSaving(true)
    try {
      const payload = { ...form, content: form.content.trim(), authorName: form.authorName.trim(), source: form.source?.trim() || undefined }
      const saved = selectedQuote
        ? await updateAdminQuote(selectedQuote.id, payload)
        : await createAdminQuote(payload)
      toast.success(selectedQuote ? '金句已更新' : '金句已创建')
      setSelectedQuote(saved)
      setForm(toForm(saved))
      await loadQuotes()
    } catch (error) {
      toast.error(getErrorMessage(error, '保存金句失败'))
    } finally {
      setSaving(false)
    }
  }

  /**
   * 确认软删除金句并清空当前编辑状态。
   */
  const handleDelete = async () => {
    if (!deleteTarget) return
    setActionId(deleteTarget.id)
    try {
      await deleteAdminQuote(deleteTarget.id)
      toast.success('金句已删除')
      if (selectedQuote?.id === deleteTarget.id) handleCreate()
      setDeleteTarget(null)
      if (quotes.length === 1 && page > 1) setPage((previous) => previous - 1)
      else await loadQuotes()
    } catch (error) {
      toast.error(getErrorMessage(error, '删除金句失败'))
    } finally {
      setActionId(null)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-zinc-200/60 pb-3 dark:border-zinc-800">
        <div>
          <h1 className="font-heading text-xl font-bold text-neutral-dark dark:text-zinc-50">金句管理</h1>
          <p className="mt-1 text-[11px] font-medium text-zinc-400">WORKSPACE / QUOTE WALL · 共 {total} 条记录</p>
        </div>
        <button type="button" onClick={handleCreate} className="inline-flex h-9 items-center gap-1.5 bg-primary px-3 text-xs font-bold text-white transition-opacity hover:opacity-90">
          <Plus size={14} /> 新建金句
        </button>
      </header>

      <div className="flex flex-col justify-between gap-3 border-b border-zinc-200/50 pb-3 md:flex-row md:items-center dark:border-zinc-800">
        <div className="flex items-center gap-1 overflow-x-auto">
          {STATUS_OPTIONS.map((option) => (
            <button key={option.value || 'all'} type="button" onClick={() => { setStatus(option.value); setPage(1) }} className={cn('h-8 whitespace-nowrap px-3 text-xs font-semibold transition-colors', status === option.value ? 'bg-primary text-white' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800')}>
              {option.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearch} className="flex items-center border-b border-zinc-300 focus-within:border-primary md:w-72">
          <Search size={14} className="mr-2 text-zinc-400" />
          <input value={keywordInput} onChange={(event) => setKeywordInput(event.target.value)} placeholder="搜索正文、署名或出处" className="h-8 min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-zinc-400" />
          {keywordInput && <button type="button" onClick={() => { setKeywordInput(''); setKeyword(''); setPage(1) }} className="p-1 text-zinc-400 hover:text-zinc-700" aria-label="清空搜索"><X size={13} /></button>}
        </form>
      </div>

      <div className="grid min-h-[560px] border border-zinc-200/70 lg:grid-cols-[minmax(0,1fr)_360px] dark:border-zinc-800">
        <section className="min-w-0 border-b border-zinc-200/70 lg:border-b-0 lg:border-r dark:border-zinc-800">
          {loading ? (
            <div className="flex min-h-80 items-center justify-center gap-2 text-xs text-zinc-500"><LoaderCircle size={16} className="animate-spin" />正在加载金句</div>
          ) : quotes.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center gap-3 text-sm text-zinc-500"><span>暂无符合条件的金句</span><button type="button" onClick={handleCreate} className="text-xs font-semibold text-primary hover:underline">新建第一句</button></div>
          ) : (
            <div className="divide-y divide-zinc-200/70 dark:divide-zinc-800">
              {quotes.map((quote) => {
                const active = selectedQuote?.id === quote.id
                const busy = actionId === quote.id
                return (
                  <article key={quote.id} className={cn('group flex gap-3 px-4 py-4 transition-colors sm:px-5', active ? 'bg-primary/[0.045]' : 'hover:bg-zinc-50/70 dark:hover:bg-zinc-900/30')}>
                    <button type="button" onClick={() => handleSelect(quote)} className="min-w-0 flex-1 text-left">
                      <p className="line-clamp-2 font-serif text-base leading-6 text-zinc-800 dark:text-zinc-100">{quote.content}</p>
                      <p className="mt-2 truncate text-[11px] text-zinc-500">{formatDateTime(quote.createdAt)} · {quote.authorName}{quote.source ? ` · ${quote.source}` : ''}</p>
                    </button>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className={cn('text-[10px] font-bold', quote.status === 'APPROVED' ? 'text-emerald-600' : quote.status === 'PENDING' ? 'text-amber-600' : 'text-red-500')}>
                        {quote.status === 'APPROVED' ? '已发布' : quote.status === 'PENDING' ? '待审核' : '已拒绝'}
                      </span>
                      <div className="flex items-center gap-1 opacity-75 transition-opacity group-hover:opacity-100">
                        {quote.status !== 'APPROVED' && <button type="button" onClick={() => handleStatusChange(quote, 'APPROVED')} disabled={busy} className="p-1.5 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50" aria-label="发布金句"><Check size={14} /></button>}
                        <button type="button" onClick={() => handleTogglePin(quote)} disabled={busy} className={cn('p-1.5 hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-zinc-800', quote.isPinned ? 'text-primary' : 'text-zinc-400')} aria-label={quote.isPinned ? '取消置顶' : '置顶金句'}><Pin size={14} fill={quote.isPinned ? 'currentColor' : 'none'} /></button>
                        <button type="button" onClick={() => setDeleteTarget(quote)} disabled={busy} className="p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50" aria-label="删除金句"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
          <footer className="flex items-center justify-between border-t border-zinc-200/70 px-4 py-3 text-xs text-zinc-500 dark:border-zinc-800 sm:px-5">
            <button type="button" onClick={() => setPage((previous) => previous - 1)} disabled={page <= 1 || loading} className="inline-flex items-center gap-1 disabled:opacity-35"><ChevronLeft size={14} />上一页</button>
            <span>{page} / {totalPages}</span>
            <button type="button" onClick={() => setPage((previous) => previous + 1)} disabled={page >= totalPages || loading} className="inline-flex items-center gap-1 disabled:opacity-35">下一页<ChevronRight size={14} /></button>
          </footer>
        </section>

        <aside className="p-4 sm:p-5">
          <div className="mb-5 flex items-center justify-between border-b border-zinc-200/70 pb-3 dark:border-zinc-800">
            <div>
              <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{selectedQuote ? '编辑金句' : '新建金句'}</h2>
              {selectedQuote && <p className="mt-1 text-[10px] text-zinc-400">投稿者：{selectedQuote.userNickname || selectedQuote.authorName}</p>}
            </div>
            {selectedQuote && <button type="button" onClick={handleCreate} className="text-[11px] font-semibold text-zinc-500 hover:text-primary">切换新建</button>}
          </div>

          <form className="space-y-4" onSubmit={handleSave}>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">金句正文
              <textarea value={form.content} onChange={(event) => setForm((previous) => ({ ...previous, content: event.target.value }))} maxLength={300} rows={5} className="mt-2 w-full resize-none border border-zinc-200 bg-transparent p-2.5 font-serif text-base leading-6 text-zinc-800 outline-none focus:border-primary dark:border-zinc-800 dark:text-zinc-100" required />
              <span className="mt-1 block text-right text-[10px] font-normal text-zinc-400">{form.content.length}/300</span>
            </label>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">展示署名
              <input value={form.authorName} onChange={(event) => setForm((previous) => ({ ...previous, authorName: event.target.value }))} maxLength={50} className="mt-2 h-9 w-full border-b border-zinc-300 bg-transparent px-0 text-sm outline-none focus:border-primary dark:border-zinc-700" required />
            </label>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">出处 <span className="font-normal text-zinc-400">可选</span>
              <input value={form.source || ''} onChange={(event) => setForm((previous) => ({ ...previous, source: event.target.value }))} maxLength={120} className="mt-2 h-9 w-full border-b border-zinc-300 bg-transparent px-0 text-sm outline-none focus:border-primary dark:border-zinc-700" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">字号
                <select value={form.displaySize} onChange={(event) => setForm((previous) => ({ ...previous, displaySize: event.target.value as QuoteDisplaySize }))} className="mt-2 h-9 w-full border border-zinc-200 bg-transparent px-2 text-xs outline-none focus:border-primary dark:border-zinc-800"><option value="SMALL">小</option><option value="MEDIUM">中</option><option value="LARGE">大</option></select>
              </label>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">状态
                <select value={form.status} onChange={(event) => setForm((previous) => ({ ...previous, status: event.target.value as QuoteStatus }))} className="mt-2 h-9 w-full border border-zinc-200 bg-transparent px-2 text-xs outline-none focus:border-primary dark:border-zinc-800"><option value="PENDING">待审核</option><option value="APPROVED">已发布</option><option value="REJECTED">已拒绝</option></select>
              </label>
            </div>
            <div className="flex items-center justify-between gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400"><input type="checkbox" checked={form.isPinned} onChange={(event) => setForm((previous) => ({ ...previous, isPinned: event.target.checked }))} className="accent-[#727BBA]" />置顶展示</label>
              <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">排序<input type="number" value={form.sortOrder} onChange={(event) => setForm((previous) => ({ ...previous, sortOrder: Number(event.target.value) || 0 }))} className="h-8 w-16 border-b border-zinc-300 bg-transparent text-center text-xs outline-none focus:border-primary dark:border-zinc-700" /></label>
            </div>
            <button type="submit" disabled={saving} className="inline-flex h-10 w-full items-center justify-center gap-2 bg-primary text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60">{saving && <LoaderCircle size={14} className="animate-spin" />}{selectedQuote ? '保存修改' : '创建并保存'}</button>
          </form>
        </aside>
      </div>

      <ConfirmModal open={Boolean(deleteTarget)} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} title="删除这条金句？" description="删除后将不再在前台或后台列表中显示。" confirmLabel="确认删除" loading={actionId === deleteTarget?.id} />
    </div>
  )
}
