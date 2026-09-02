'use client'

import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, ArrowDown, LoaderCircle } from 'lucide-react'
import Navbar from '@/components/common/Navbar'
import SidebarWidget from '@/components/common/SidebarWidget'
import Footer from '@/components/common/Footer'
import QuoteSkeleton from '@/components/quote/QuoteSkeleton'
import QuoteWall from '@/components/quote/QuoteWall'
import { fetchPublicQuotes } from '@/lib/quote-api'
import { fetchProfile } from '@/lib/profile'
import type { ProfileVO } from '@/types/profile'
import type { QuoteItem } from '@/types/quote'

const PAGE_SIZE = 12

/**
 * 金句留言墙前台页面。
 */
export default function QuotesPage() {
  const [profile, setProfile] = useState<ProfileVO | null>(null)
  const [quotes, setQuotes] = useState<QuoteItem[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * 请求指定页码的已审核金句，并可选择追加到现有展墙。
   */
  const loadQuotes = useCallback(async (targetPage: number, append = false) => {
    if (append) setLoadingMore(true)
    else setLoading(true)
    setError(null)

    try {
      const data = await fetchPublicQuotes(targetPage, PAGE_SIZE)
      setQuotes((previous) => append ? [...previous, ...(data.records || [])] : (data.records || []))
      setPage(data.page || targetPage)
      setTotal(data.total || 0)
    } catch (requestError) {
      console.warn('加载金句墙失败:', requestError)
      setError('暂时无法加载金句墙，请稍后重试')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchProfile('butvan').then(setProfile)
      void loadQuotes(1)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [loadQuotes])

  const hasMore = quotes.length < total

  return (
    <main className="flex min-h-screen w-full flex-col bg-transparent text-zinc-900">
      <Navbar profile={profile} />
      <SidebarWidget />

      <div className="mx-auto min-h-[100svh] w-full max-w-[1380px] flex-1 px-4 pb-12 pt-7 sm:px-6 md:pt-9 lg:px-8">
        <section aria-label="金句墙内容">
          {loading ? (
            <QuoteSkeleton />
          ) : error ? (
            <div className="flex min-h-60 flex-col items-center justify-center gap-3 text-center">
              <AlertCircle size={22} className="text-zinc-400" />
              <p className="text-sm text-zinc-600">{error}</p>
              <button type="button" onClick={() => loadQuotes(1)} className="text-xs font-semibold text-[#727BBA] hover:underline">重新加载</button>
            </div>
          ) : quotes.length === 0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center text-center">
              <p className="font-serif text-xl text-zinc-700">暂未发布金句</p>
              <p className="mt-2 text-sm text-zinc-500">站长会在这里分享值得停留的话。</p>
            </div>
          ) : (
            <>
              <QuoteWall quotes={quotes} />
              {hasMore && (
                <div className="mt-12 flex justify-center">
                  <button type="button" onClick={() => loadQuotes(page + 1, true)} disabled={loadingMore} className="inline-flex min-h-10 items-center gap-2 border-b border-zinc-300 px-3 text-xs font-semibold text-zinc-600 transition-colors hover:border-[#727BBA] hover:text-[#626aa3] disabled:cursor-not-allowed disabled:opacity-55">
                    {loadingMore ? <LoaderCircle size={14} className="animate-spin" /> : <ArrowDown size={14} />}
                    {loadingMore ? '正在拾取更多句子' : '再读一些'}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <Footer />
    </main>
  )
}
