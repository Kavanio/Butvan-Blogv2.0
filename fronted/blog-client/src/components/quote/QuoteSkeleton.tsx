/**
 * 金句墙加载中的文字骨架屏，保持无卡片的展墙节奏。
 */
export default function QuoteSkeleton() {
  const widths = ['lg:col-span-5', 'lg:col-start-7 lg:col-span-4', 'lg:col-start-3 lg:col-span-7', 'lg:col-span-4', 'lg:col-start-6 lg:col-span-5', 'lg:col-start-2 lg:col-span-5']

  return (
    <div className="grid grid-cols-1 gap-y-9 md:grid-cols-6 md:gap-x-5 lg:grid-cols-12 lg:gap-x-6">
      {widths.map((width, index) => (
        <div key={width} className={`space-y-3 animate-pulse ${width}`} style={{ animationDelay: `${index * 70}ms` }}>
          <div className="h-7 w-full bg-zinc-200/70" />
          <div className="h-7 w-4/5 bg-zinc-200/55" />
          <div className="h-2 w-20 bg-zinc-200/70" />
        </div>
      ))}
    </div>
  )
}
