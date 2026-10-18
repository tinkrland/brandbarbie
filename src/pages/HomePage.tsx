import { Link, useNavigate } from 'react-router-dom'
import { Sprout } from 'lucide-react'
import { getPage, getPages, getAllTags } from '@/lib/content'
import { MarkdownContent } from '@/lib/markdown'
import Layout from '@/components/Layout'
import RightSidebar from '@/components/RightSidebar'

const TAG_COLORS = [
  'bg-amber-100 text-amber-800',
  'bg-rose-100 text-rose-800',
  'bg-emerald-100 text-emerald-800',
  'bg-sky-100 text-sky-800',
  'bg-violet-100 text-violet-800',
  'bg-orange-100 text-orange-800',
]
function tagColor(tag: string) {
  let h = 0; for (const c of tag) h = (h * 31 + c.charCodeAt(0)) % TAG_COLORS.length; return TAG_COLORS[h]
}

export default function HomePage() {
  const navigate = useNavigate()
  const index = getPage('index')
  const pages = getPages()
  const tags = getAllTags()
  const recent = pages.filter(p => p.slug !== 'index').slice(0, 6)

  if (index) {
    return (
      <Layout rightPanel={<RightSidebar page={index} />}>
        <article>
          <header className="mb-8">
            <h1 className="font-serif text-3xl font-bold text-foreground leading-tight mb-2">{index.title}</h1>
            {index.frontmatter.summary && (
              <p className="text-muted-foreground text-sm italic">{index.frontmatter.summary}</p>
            )}
          </header>
          <Link
            to="/build"
            className="group mb-8 flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-border bg-card hover:border-foreground/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Sprout size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
              <div>
                <div className="text-sm font-medium">build your own garden</div>
                <div className="text-xs text-muted-foreground">edit in the browser, export as a zip, host anywhere</div>
              </div>
            </div>
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">open builder →</span>
          </Link>
          <hr className="border-border mb-8" />
          <MarkdownContent content={index.content} pages={pages} />
        </article>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-2xl">
        <header className="mb-10">
          <h1 className="font-serif text-3xl font-bold mb-2">the garden</h1>
          <p className="text-muted-foreground text-sm">a space for thinking, linking, and growing ideas.</p>
        </header>

        {tags.length > 0 && (
          <div className="mb-10">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-3">topics</p>
            <div className="flex flex-wrap gap-2">
              {tags.map(({ tag, count }) => (
                <button key={tag} onClick={() => navigate(`/tag/${tag}`)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium hover:opacity-80 transition-opacity ${tagColor(tag)}`}>
                  {tag} <span className="opacity-60">{count}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {recent.length > 0 && (
          <div>
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-3">all notes</p>
            <div className="space-y-2">
              {recent.map(page => (
                <button key={page.slug} onClick={() => navigate(`/note/${page.slug}`)}
                  className="w-full text-left p-4 bg-card rounded-lg border border-border hover:border-foreground/20 transition-colors shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-medium mb-0.5">{page.title}</h3>
                      {page.frontmatter.summary && (
                        <p className="text-xs text-muted-foreground">{page.frontmatter.summary}</p>
                      )}
                    </div>
                    {page.frontmatter.date && (
                      <span className="text-[10px] text-muted-foreground/60 flex-shrink-0">{page.frontmatter.date}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
