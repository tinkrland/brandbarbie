import { useNavigate } from 'react-router-dom'
import { Tag, Hash } from 'lucide-react'
import { getAllTags } from '@/lib/content'
import Layout from '@/components/Layout'

const TAG_PALETTE = ['#E47C67','#DE8BA3','#A6AD6E','#93B4BE','#A5758E','#91786B']

function tagStyle(tag: string) {
  let h = 0; for (const c of tag) h = (h * 31 + c.charCodeAt(0)) % TAG_PALETTE.length
  const col = TAG_PALETTE[h]
  return { backgroundColor: `${col}28`, color: col, borderColor: `${col}55` }
}

export default function TagsPage() {
  const navigate = useNavigate()
  const tags = getAllTags()

  return (
    <Layout>
      <div className="max-w-2xl">
        <header className="mb-8">
          <div className="flex items-center gap-2.5 mb-2">
            <Tag size={18} className="text-muted-foreground/60" />
            <h1 className="font-serif text-2xl font-light tracking-tight">tags</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            every tag used across the brand book. pick one to see all its pages.
          </p>
        </header>

        {tags.length === 0 ? (
          <p className="text-muted-foreground text-sm">no tags yet.</p>
        ) : (
          <div className="p-4 bg-card rounded-lg border border-border">
            <div className="flex flex-wrap gap-1.5">
              {tags.map(({ tag, count }) => (
                <button
                  key={tag}
                  onClick={() => navigate(`/tag/${tag}`)}
                  className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border font-medium transition-all hover:opacity-80"
                  style={tagStyle(tag)}
                >
                  <Hash size={8} />
                  {tag}
                  <span className="opacity-50 text-[9px] ml-0.5">{count}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
