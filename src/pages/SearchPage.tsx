import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { getPages, searchPages, getExcerpt } from '@/lib/content'
import Layout from '@/components/Layout'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const results = useMemo(() => (query.trim() ? searchPages(query) : []), [query])
  const all = useMemo(() => getPages().filter(p => p.slug !== 'index'), [])

  const pages = query.trim() ? results : all
  const heading = query.trim() ? `${results.length} ${results.length === 1 ? 'result' : 'results'}` : 'all pages'

  return (
    <Layout>
      <div className="max-w-2xl">
        <header className="mb-8">
          <div className="flex items-center gap-2.5 mb-2">
            <Search size={18} className="text-muted-foreground/60" />
            <h1 className="font-serif text-2xl font-light tracking-tight">search</h1>
          </div>
          <p className="text-muted-foreground text-sm">search every page in the brand book by title, tag, or content.</p>
        </header>

        <div className="relative mb-8">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 pointer-events-none" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="type to search…"
            className="w-full bg-card border border-border rounded-lg pl-9 pr-9 py-3 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {pages.length === 0 ? (
          <p className="text-muted-foreground text-sm">no results for “{query}”.</p>
        ) : (
          <div>
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground/50 mb-3">{heading}</p>
            <div className="space-y-2">
              {pages.map(page => (
                <button
                  key={page.slug}
                  onClick={() => navigate(`/note/${page.slug}`)}
                  className="w-full text-left p-4 bg-card rounded-lg border border-border hover:border-foreground/20 transition-colors shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-medium mb-0.5">{page.title}</h3>
                      <p className="text-xs text-muted-foreground">{getExcerpt(page.content, 120)}</p>
                    </div>
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
