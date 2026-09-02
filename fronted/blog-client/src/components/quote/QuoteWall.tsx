import type { QuoteItem } from '@/types/quote'

interface QuoteWallProps {
  quotes: QuoteItem[]
}

const LAYOUT_CLASSES = [
  'md:col-span-4 lg:col-start-1 lg:col-span-5',
  'md:col-start-3 md:col-span-4 lg:col-start-7 lg:col-span-5 lg:mt-10',
  'md:col-span-6 lg:col-start-3 lg:col-span-7 lg:-mt-2',
  'md:col-span-3 lg:col-start-1 lg:col-span-4 lg:mt-7',
  'md:col-start-2 md:col-span-5 lg:col-start-6 lg:col-span-6 lg:mt-2',
  'md:col-span-4 lg:col-start-2 lg:col-span-5 lg:-mt-1',
  'md:col-start-3 md:col-span-3 lg:col-start-8 lg:col-span-4 lg:mt-8',
  'md:col-span-6 lg:col-start-4 lg:col-span-7 lg:mt-1',
]

/**
 * 格式化前台展示日期。
 *
 * @param value ISO 时间字符串
 * @returns 年月日格式日期
 */
function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date).replaceAll('/', '.')
}

/**
 * 使用记录主键计算稳定布局，避免翻页和加载更多时金句位置跳动。
 *
 * @param id 金句主键
 * @returns 栅格定位类名
 */
function getLayoutClass(id: number): string {
  return LAYOUT_CLASSES[Math.abs(id) % LAYOUT_CLASSES.length]
}

/**
 * 将后台视觉字号映射为前台排版尺寸。
 *
 * @param displaySize 后台保存的字号枚举
 * @returns Tailwind 字号类名
 */
function getTextClass(displaySize: QuoteItem['displaySize']): string {
  if (displaySize === 'SMALL') return 'text-[1.25rem] leading-[1.6] md:text-[1.5rem]'
  if (displaySize === 'LARGE') return 'text-[1.9rem] leading-[1.36] md:text-[2.7rem]'
  return 'text-[1.45rem] leading-[1.5] md:text-[2rem]'
}

/**
 * 以无边框、错位文字流形式呈现一组已审核金句。
 */
export default function QuoteWall({ quotes }: QuoteWallProps) {
  return (
    <section className="grid grid-cols-1 gap-y-7 md:grid-cols-6 md:gap-x-5 md:gap-y-3 lg:grid-cols-12 lg:gap-x-6" aria-label="金句列表">
      {quotes.map((quote, index) => (
        <article
          key={quote.id}
          className={`quote-wall-entry group relative py-1 md:py-2 ${getLayoutClass(quote.id)}`}
          style={{ animationDelay: `${Math.min(index * 55, 440)}ms` }}
        >
          <span className="quote-wall-mark" aria-hidden="true">“</span>
          <p className={`quote-wall-text m-0 font-serif font-medium text-zinc-900 ${getTextClass(quote.displaySize)}`}>
            {quote.content}
          </p>
          <footer className="quote-wall-meta mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] font-medium tracking-[0.12em] text-zinc-500">
            <span>{formatDate(quote.createdAt)}</span>
            {quote.authorName && <span>· {quote.authorName}</span>}
            {quote.source && <span>· {quote.source}</span>}
          </footer>
        </article>
      ))}
    </section>
  )
}
