'use client'

import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, ArrowDown, Feather, LoaderCircle } from 'lucide-react'
import { toast } from '@heroui/react'
import Navbar from '@/components/common/Navbar'
import SidebarWidget from '@/components/common/SidebarWidget'
import Footer from '@/components/common/Footer'
import LoginModal from '@/components/auth/LoginModal'
import QuoteComposer from '@/components/quote/QuoteComposer'
import QuoteSkeleton from '@/components/quote/QuoteSkeleton'
import QuoteWall from '@/components/quote/QuoteWall'
import { fetchPublicQuotes } from '@/lib/quote-api'
import { fetchProfile } from '@/lib/profile'
import { useAuth } from '@/contexts/AuthContext'
import type { ProfileVO } from '@/types/profile'
import type { QuoteItem } from '@/types/quote'

const PAGE_SIZE = 12

/**
 * 金句留言墙前台页面。
 */
export default function QuotesPage() {
  const { isLoggedIn } = useAuth()
  const [profile, setProfile] = useState<ProfileVO | null>(null)
  const [quotes, setQuotes] = useState<QuoteItem[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [composerOpen, setComposerOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

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

  /**
   * 根据当前登录状态决定打开登录窗还是投稿窗。
   */
  const handleOpenComposer = () => {
    if (isLoggedIn) {
      setComposerOpen(true)
      return
    }
    toast.info('登录后就可以留下你的句子')
    setLoginOpen(true)
  }

  /**
   * 投稿成功后回到第一页，保证新审核内容下次刷新能自然出现。
   */
  const handleSubmitted = () => {
    loadQuotes(1)
  }

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

      <div className="mx-auto w-full max-w-[1380px] flex-1 px-4 pb-16 pt-12 sm:px-6 md:pt-16 lg:px-8">
        <header className="flex flex-col gap-5 border-b border-zinc-200/80 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#727BBA]">
              <Feather size={15} strokeWidth={1.6} />
              <span className="text-[10px] font-semibold tracking-[0.16em]">拾句</span>
            </div>
            <h1 className="mt-3 font-serif text-3xl font-semibold tracking-[-0.02em] text-zinc-900 md:text-4xl">让打动你的话，停在这里。</h1>
            <p className="mt-2 text-sm text-zinc-500">写下来自生活、阅读，或某个突然清晰的瞬间。</p>
          </div>
          <button type="button" onClick={handleOpenComposer} className="inline-flex min-h-10 w-fit items-center gap-2 border border-[#727BBA]/35 px-4 text-xs font-semibold text-[#626aa3] transition-colors hover:border-[#727BBA] hover:bg-[#727BBA]/5">
            <Feather size={14} />
            写下一句
          </button>
        </header>

        <section className="pt-9 md:pt-11">
          {loading ? (
            <QuoteSkeleton />
          ) : error ? (
            <div className="flex min-h-60 flex-col items-center justify-center gap-3 text-center">
              <AlertCircle size={22} className="text-zinc-400" />
              <p className="text-sm text-zinc-600">{error}</p>
              <button type="button" onClick={() => loadQuotes(1)} className="text-xs font-semibold text-[#727BBA] hover:underline">重新加载</button>
            </div>
          ) : quotes.length === 0 ? (
            <div className="flex min-h-60 flex-col items-center justify-center text-center">
              <p className="font-serif text-xl text-zinc-700">第一句话，等你写下。</p>
              <button type="button" onClick={handleOpenComposer} className="mt-4 text-xs font-semibold text-[#727BBA] hover:underline">留下一句</button>
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
      {composerOpen && <QuoteComposer onClose={() => setComposerOpen(false)} onSubmitted={handleSubmitted} />}
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </main>
  )
}
