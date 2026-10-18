import { useState } from 'react'
import { useParams, Navigate, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { getPage, getPages, getAdjacentPages, Page } from '@/lib/content'
import { MarkdownContent } from '@/lib/markdown'
import Layout from '@/components/Layout'
import RightSidebar from '@/components/RightSidebar'
import PagePreviewCard from '@/components/PagePreviewCard'
import LockScreen from '@/components/LockScreen'

function NavLink({ page, direction }: { page: Page; direction: 'prev' | 'next' }) {
  const navigate = useNavigate()
  const isNext = direction === 'next'
  return (
    <HoverCard openDelay={350} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button
          onClick={() => navigate(`/note/${page.slug}`)}
          className={`flex flex-col gap-1 group max-w-[48%] ${isNext ? 'items-end text-right' : 'items-start text-left'}`}
        >
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground/40 flex items-center gap-0.5">
            {!isNext && <ChevronLeft size={10} />}
            {direction}
            {isNext && <ChevronRight size={10} />}
          </span>
          <span className="font-serif text-[14px] text-muted-foreground group-hover:text-foreground transition-colors leading-snug">
            {page.title}
          </span>
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        className="w-64 preview-card"
        align={isNext ? 'end' : 'start'}
        sideOffset={8}
      >
        <PagePreviewCard page={page} />
      </HoverCardContent>
    </HoverCard>
  )
}

export default function NotePage() {
  const { '*': slug } = useParams<{ '*': string }>()
  if (!slug) return <Navigate to="/" replace />

  const page = getPage(slug)
  if (!page) {
    return (
      <Layout>
        <div className="py-20 text-center">
          <p className="text-muted-foreground text-sm">page not found: <code className="font-mono">{slug}</code></p>
        </div>
      </Layout>
    )
  }

  const password = page.frontmatter.password
  const isLocked = !!password
  const [unlocked, setUnlocked] = useState(() =>
    isLocked ? sessionStorage.getItem(`qw-unlock-${slug}`) === '1' : true
  )

  const pages = getPages()
  const { prev, next } = getAdjacentPages(slug)

  if (isLocked && !unlocked) {
    return (
      <Layout currentSlug={slug} rightPanel={<RightSidebar page={page} />}>
        <LockScreen
          slug={slug}
          title={page.title}
          correctPassword={password!}
          onUnlock={() => setUnlocked(true)}
        />
      </Layout>
    )
  }

  return (
    <Layout currentSlug={slug} rightPanel={<RightSidebar page={page} />}>
      <article>
        {/* Cover */}
        {page.frontmatter.cover && (
          <img src={page.frontmatter.cover} alt="" className="w-full h-40 object-cover rounded-lg mb-8 opacity-90" />
        )}

        {/* Header */}
        <header className="mb-8">
          <h1 className="font-serif text-[2rem] font-light text-foreground leading-tight mb-3 tracking-tight">
            {page.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            {page.frontmatter.date && (
              <span className="text-xs text-muted-foreground">{page.frontmatter.date}</span>
            )}
            {page.frontmatter.tags && page.frontmatter.tags.length > 0 && (
              <div className="flex gap-1.5">
                {page.frontmatter.tags.map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{tag}</span>
                ))}
              </div>
            )}
          </div>
          {page.frontmatter.summary && (
            <p className="mt-3 text-muted-foreground text-sm leading-relaxed italic">{page.frontmatter.summary}</p>
          )}
        </header>

        {/* Content */}
        <MarkdownContent content={page.content} pages={pages} />

        {/* Prev / Next navigation */}
        {(prev || next) && (
          <nav className="mt-14 pt-6 border-t border-border flex justify-between items-start gap-4">
            {prev ? <NavLink page={prev} direction="prev" /> : <div />}
            {next ? <NavLink page={next} direction="next" /> : <div />}
          </nav>
        )}
      </article>
    </Layout>
  )
}
