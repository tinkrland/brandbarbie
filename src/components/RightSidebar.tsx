import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Page, extractTOC, getBacklinks, getLinkedPages } from '@/lib/content'
import LocalGraph from './LocalGraph'
import PagePreviewCard from './PagePreviewCard'

const TAG_PALETTE = ['#E47C67','#DE8BA3','#A6AD6E','#93B4BE','#A5758E','#91786B']
function tagStyle(tag: string) {
  let h = 0; for (const c of tag) h = (h * 31 + c.charCodeAt(0)) % TAG_PALETTE.length
  const col = TAG_PALETTE[h]
  return { backgroundColor: `${col}28`, color: col, borderColor: `${col}55` }
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="py-4 border-b border-border last:border-b-0">
      <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-2.5">{title}</p>
      {children}
    </div>
  )
}

function PageLink({ page, prefix }: { page: Page; prefix?: string }) {
  const navigate = useNavigate()
  return (
    <HoverCard openDelay={350} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button
          onClick={() => navigate(`/note/${page.slug}`)}
          className="block w-full text-left text-[11px] text-muted-foreground hover:text-foreground transition-colors truncate py-0.5 group"
        >
          <span className="opacity-40 mr-1 group-hover:opacity-60">{prefix}</span>
          {page.title}
        </button>
      </HoverCardTrigger>
      <HoverCardContent side="left" className="w-64 preview-card" sideOffset={8}>
        <PagePreviewCard page={page} />
      </HoverCardContent>
    </HoverCard>
  )
}

interface Props { page: Page }

export default function RightSidebar({ page }: Props) {
  const navigate = useNavigate()
  const toc = extractTOC(page.content)
  const backlinks = getBacklinks(page.slug)
  const linked = getLinkedPages(page.slug)
  const tags = page.frontmatter.tags || []

  return (
    <aside className="w-72 flex-shrink-0 h-screen overflow-y-auto no-scrollbar px-5 py-4 border-l border-border bg-card/50">

      {/* Graph */}
      {(linked.length > 0 || backlinks.length > 0 || tags.length > 0) && (
        <Section title="connections">
          <LocalGraph currentPage={page} linked={linked} backlinks={backlinks} />
        </Section>
      )}

      {/* TOC */}
      {toc.length > 1 && (
        <Section title="on this page">
          <nav className="space-y-0.5">
            {toc.map(item => (
              <a key={item.id} href={`#${item.id}`}
                className="block text-[11px] text-muted-foreground hover:text-foreground transition-colors py-0.5 truncate"
                style={{ paddingLeft: `${(item.level - 1) * 10}px` }}>
                {item.text}
              </a>
            ))}
          </nav>
        </Section>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <Section title="tags">
          <div className="flex flex-wrap gap-1.5">
            {tags.map(tag => (
              <button key={tag} onClick={() => navigate(`/tag/${tag}`)}
                className="text-[10px] px-2 py-0.5 rounded-full font-medium border transition-opacity hover:opacity-75"
                style={tagStyle(tag)}>
                {tag}
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Backlinks */}
      {backlinks.length > 0 && (
        <Section title="linked here">
          <div className="space-y-0.5">
            {backlinks.map(p => <PageLink key={p.slug} page={p} prefix="←" />)}
          </div>
        </Section>
      )}

      {/* Outbound links */}
      {linked.length > 0 && (
        <Section title="links out">
          <div className="space-y-0.5">
            {linked.map(p => <PageLink key={p.slug} page={p} prefix="→" />)}
          </div>
        </Section>
      )}

      {/* Metadata */}
      <Section title="metadata">
        <dl className="space-y-1.5">
          {page.frontmatter.date && (
            <div>
              <dt className="text-[9px] text-muted-foreground/50 uppercase tracking-wider">date</dt>
              <dd className="text-[11px] text-muted-foreground">{page.frontmatter.date}</dd>
            </div>
          )}
          {page.frontmatter.summary && (
            <div>
              <dt className="text-[9px] text-muted-foreground/50 uppercase tracking-wider">summary</dt>
              <dd className="text-[11px] text-muted-foreground leading-snug">{page.frontmatter.summary}</dd>
            </div>
          )}
        </dl>
      </Section>
    </aside>
  )
}
