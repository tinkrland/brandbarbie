import { useParams, useNavigate } from 'react-router-dom'
import { getPagesByTag, getAllTags } from '@/lib/content'
import Layout from '@/components/Layout'
import { Tag, Hash, FileText, Calendar } from 'lucide-react'

const TAG_PALETTE = ['#E47C67','#DE8BA3','#A6AD6E','#93B4BE','#A5758E','#91786B']

function tagStyle(tag: string) {
  let h = 0; for (const c of tag) h = (h * 31 + c.charCodeAt(0)) % TAG_PALETTE.length
  const col = TAG_PALETTE[h]
  return { backgroundColor: `${col}28`, color: col, borderColor: `${col}55` }
}

export default function TagPage() {
  const { tag } = useParams<{ tag: string }>()
  const navigate = useNavigate()
  const allTags = getAllTags()

  if (!tag) return null

  const pages = getPagesByTag(tag)

  return (
    <Layout>
      <div className="max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-6">
          <Hash size={18} className="text-muted-foreground/60" />
          <h1 className="font-serif text-2xl font-light tracking-tight">{tag}</h1>
          <span className="text-muted-foreground/50 text-xs ml-0.5 mt-0.5">
            {pages.length} {pages.length === 1 ? 'note' : 'notes'}
          </span>
        </div>

        {/* ── TAGS ON TOP ──────────────────────────────────── */}
        <div className="mb-8 p-4 bg-card rounded-lg border border-border">
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground/50 mb-3 flex items-center gap-1.5">
            <Tag size={9} /> browse by tag
          </p>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map(({ tag: t, count }) => (
              <button
                key={t}
                onClick={() => navigate(`/tag/${t}`)}
                className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border font-medium transition-all hover:opacity-80"
                style={t === tag ? { backgroundColor: 'hsl(var(--foreground))', color: 'hsl(var(--primary-foreground))', borderColor: 'hsl(var(--foreground))' } : tagStyle(t)}
              >
                <Hash size={8} />
                {t}
                <span className="opacity-50 text-[9px] ml-0.5">{count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── RESULTS BELOW ────────────────────────────────── */}
        {pages.length === 0 ? (
          <p className="text-muted-foreground/50 text-sm italic">no notes with this tag.</p>
        ) : (
          <div className="space-y-2.5">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground/50 mb-3">notes tagged #{tag}</p>
            {pages.map(page => (
              <button
                key={page.slug}
                onClick={() => navigate(`/note/${page.slug}`)}
                className="w-full text-left p-4 bg-card rounded-lg border border-border hover:border-foreground/20 transition-all shadow-sm hover:shadow-md group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <FileText size={11} className="text-muted-foreground/50 flex-shrink-0" />
                      <h2 className="font-medium text-[13px] truncate group-hover:text-foreground transition-colors">{page.title}</h2>
                    </div>
                    {page.frontmatter.summary && (
                      <p className="text-[11px] text-muted-foreground/70 leading-relaxed line-clamp-2 ml-4">{page.frontmatter.summary}</p>
                    )}
                    {page.frontmatter.tags && page.frontmatter.tags.length > 1 && (
                      <div className="flex gap-1 mt-2 ml-4 flex-wrap">
                        {page.frontmatter.tags.filter(t => t !== tag).map(t => (
                          <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full border" style={tagStyle(t)}>#{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  {page.frontmatter.date && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground/40 flex-shrink-0 mt-0.5">
                      <Calendar size={9} />
                      {page.frontmatter.date}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
