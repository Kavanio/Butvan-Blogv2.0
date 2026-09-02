'use client'

import { useId, useState } from 'react'
import { LoaderCircle, Send, X } from 'lucide-react'
import { toast } from '@heroui/react'
import { createQuote } from '@/lib/quote-api'
import { useAuth } from '@/contexts/AuthContext'

interface QuoteComposerProps {
  onClose: () => void
  onSubmitted: () => void
}

/**
 * 登录用户金句投稿弹层，提交后内容进入后台审核队列。
 */
export default function QuoteComposer({ onClose, onSubmitted }: QuoteComposerProps) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [authorName, setAuthorName] = useState(user?.nickname || '')
  const [source, setSource] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const contentId = useId()
  const authorId = useId()
  const sourceId = useId()

  /**
   * 关闭弹层并避免提交中重复触发。
   */
  const handleClose = () => {
    if (!submitting) onClose()
  }

  /**
   * 提交金句并在成功后通知父组件刷新列表。
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!content.trim()) {
      toast.danger('请先写下一句想留下的话')
      return
    }

    setSubmitting(true)
    try {
      await createQuote({
        content: content.trim(),
        authorName: authorName.trim() || undefined,
        source: source.trim() || undefined,
      })
      toast.success('已收到你的留言，审核通过后会出现在墙上')
      onSubmitted()
      onClose()
    } catch (error) {
      toast.danger(error instanceof Error ? error.message : '提交失败，请稍后再试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-zinc-950/25 p-3 backdrop-blur-[2px] sm:items-center sm:justify-center" role="presentation" onMouseDown={handleClose}>
      <section
        className="w-full max-w-lg border border-zinc-200 bg-white p-5 shadow-xl shadow-zinc-950/10 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-composer-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-5 border-b border-zinc-200 pb-4">
          <div>
            <h2 id="quote-composer-title" className="font-serif text-xl font-semibold text-zinc-900">留下一句</h2>
            <p className="mt-1 text-xs leading-5 text-zinc-500">它会先送往审核，再成为这面墙上的一部分。</p>
          </div>
          <button type="button" onClick={handleClose} className="-mr-1 -mt-1 p-2 text-zinc-500 transition-colors hover:text-zinc-900" aria-label="关闭投稿窗口">
            <X size={18} />
          </button>
        </header>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor={contentId} className="text-xs font-semibold text-zinc-700">这句话</label>
            <textarea
              id={contentId}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={300}
              rows={4}
              placeholder="把某个瞬间、某段文字，或者此刻的心情留在这里。"
              className="mt-2 w-full resize-none border-b border-zinc-300 bg-transparent px-0 py-2 font-serif text-lg leading-7 text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-[#727BBA]"
              disabled={submitting}
              required
            />
            <div className="mt-1 text-right text-[10px] text-zinc-400">{content.length}/300</div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label htmlFor={authorId} className="text-xs font-semibold text-zinc-700">
              署名
              <input id={authorId} value={authorName} onChange={(event) => setAuthorName(event.target.value)} maxLength={50} className="mt-2 w-full border-b border-zinc-300 bg-transparent px-0 py-2 text-sm text-zinc-800 outline-none transition-colors focus:border-[#727BBA]" disabled={submitting} />
            </label>
            <label htmlFor={sourceId} className="text-xs font-semibold text-zinc-700">
              出处 <span className="font-normal text-zinc-400">可选</span>
              <input id={sourceId} value={source} onChange={(event) => setSource(event.target.value)} maxLength={120} placeholder="一本书、一个人或某个时刻" className="mt-2 w-full border-b border-zinc-300 bg-transparent px-0 py-2 text-sm text-zinc-800 outline-none transition-colors placeholder:text-zinc-400 focus:border-[#727BBA]" disabled={submitting} />
            </label>
          </div>

          <div className="flex items-center justify-end gap-4 pt-2">
            <button type="button" onClick={handleClose} disabled={submitting} className="text-xs font-semibold text-zinc-500 transition-colors hover:text-zinc-900 disabled:opacity-40">再想想</button>
            <button type="submit" disabled={submitting} className="inline-flex min-h-10 items-center gap-2 bg-[#727BBA] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#626aa3] disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? <LoaderCircle size={15} className="animate-spin" /> : <Send size={14} />}
              提交审核
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
