import { Lock } from 'lucide-react'
import { Page, getExcerpt } from '@/lib/content'

const TAG_PALETTE = ['#E47C67','#DE8BA3','#A6AD6E','#93B4BE','#A5758E','#91786B']
function tagStyle(tag: string) {
  let h = 0; for (const c of tag) h = (h * 31 + c.charCodeAt(0)) % TAG_PALETTE.length
  const col = TAG_PALETTE[h]
  return { backgroundColor: `${col}22`, color: col }
}

interface Props { page: Page }

export default function PagePreviewCard({ page }: Props) {
  const isLocked = !!page.frontmatter.password
  const excerpt = page.frontmatter.summary || getExcerpt(page.content, 120)
  const tags = page.frontmatter.tags || []

  return (
    <div className="space-y-2.5">
      {/* Title + date */}
      <div>
        <p className="font-serif text-[13px] leading-snug text-foreground flex items-center gap-1.5">
          {isLocked && <Lock size={10} className="text-muted-foreground/50 flex-shrink-0" />}
          {page.title}
        </p>
        {page.frontmatter.date && (
          <p className="text-[9px] text-muted-foreground/55 mt-0.5 uppercase tracking-wider">{page.frontmatter.date}</p>
        )}
      </div>

      {/* Excerpt or lock notice */}
      {isLocked ? (
        <p className="text-[11px] text-muted-foreground/45 italic">password protected</p>
      ) : excerpt && (
        <p className="text-[11px] text-muted-foreground leading-relaxed">{excerpt}</p>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-0.5">
          {tags.map(tag => (
            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={tagStyle(tag)}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
