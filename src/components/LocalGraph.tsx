import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Maximize2, X, Network } from 'lucide-react'
import { Page, getPages, getAllTags } from '@/lib/content'

interface GNode { id: string; label: string; type: 'page' | 'tag'; isCurrent?: boolean }
interface GEdge { source: string; target: string }
interface SimNode extends GNode { x: number; y: number; vx: number; vy: number; pinned: boolean }

function simTick(nodes: SimNode[], edges: GEdge[], w: number, h: number, alpha: number) {
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = (nodes[i].x - nodes[j].x) || 0.01
      const dy = (nodes[i].y - nodes[j].y) || 0.01
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
      const f = (3200 * alpha) / (dist * dist)
      if (!nodes[i].pinned) { nodes[i].vx += (f * dx) / dist; nodes[i].vy += (f * dy) / dist }
      if (!nodes[j].pinned) { nodes[j].vx -= (f * dx) / dist; nodes[j].vy -= (f * dy) / dist }
    }
  }
  for (const e of edges) {
    const s = nodes.find(n => n.id === e.source)
    const t = nodes.find(n => n.id === e.target)
    if (!s || !t) continue
    const dx = t.x - s.x; const dy = t.y - s.y
    const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
    const target = 110; const f = 0.035 * (dist - target) * alpha
    if (!s.pinned) { s.vx += (f * dx) / dist; s.vy += (f * dy) / dist }
    if (!t.pinned) { t.vx -= (f * dx) / dist; t.vy -= (f * dy) / dist }
  }
  for (const n of nodes) {
    if (n.pinned) continue
    n.vx += (w / 2 - n.x) * 0.012 * alpha
    n.vy += (h / 2 - n.y) * 0.012 * alpha
    n.vx *= 0.86; n.vy *= 0.86
    n.x = Math.max(28, Math.min(w - 28, n.x + n.vx))
    n.y = Math.max(28, Math.min(h - 28, n.y + n.vy))
  }
}

interface GraphProps { nodes: GNode[]; edges: GEdge[]; w: number; h: number; dark?: boolean; onNav: (id: string, type: 'page' | 'tag') => void }

function ForceGraph({ nodes: gNodes, edges: gEdges, w, h, dark, onNav }: GraphProps) {
  const sim = useRef<SimNode[]>([])
  const raf = useRef(0)
  const alpha = useRef(1)
  const dragId = useRef<string | null>(null)
  const moved = useRef(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const [, rerender] = useState(0)

  useEffect(() => {
    cancelAnimationFrame(raf.current)
    alpha.current = 1
    sim.current = gNodes.map((n, i) => ({
      ...n,
      x: w / 2 + Math.cos((2 * Math.PI * i) / Math.max(gNodes.length, 1)) * Math.min(w, h) * 0.3,
      y: h / 2 + Math.sin((2 * Math.PI * i) / Math.max(gNodes.length, 1)) * Math.min(w, h) * 0.3,
      vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5, pinned: false,
    }))
    const loop = () => {
      if (alpha.current < 0.002) return
      alpha.current *= 0.975
      simTick(sim.current, gEdges, w, h, alpha.current)
      rerender(c => c + 1)
      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf.current)
  }, [gNodes.length, gEdges.length, w, h])

  const svgPos = (e: React.MouseEvent) => {
    const r = svgRef.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }
  const ns = sim.current

  const nodeColor = (n: SimNode) => {
    if (n.isCurrent) return dark ? '#e8dcc8' : 'hsl(28 20% 13%)'
    if (n.type === 'tag') return dark ? '#c97b3a' : 'hsl(25 55% 52%)'
    return dark ? '#2e2820' : 'hsl(40 32% 97%)'
  }
  const strokeColor = (n: SimNode) => {
    if (n.isCurrent) return 'none'
    return dark ? '#6b5c48' : 'hsl(35 18% 70%)'
  }
  const edgeColor = dark ? '#3a3028' : 'hsl(35 18% 78%)'
  const textColor = dark ? '#9a8a74' : 'hsl(28 12% 44%)'
  const currentTextColor = dark ? '#e8dcc8' : 'hsl(40 30% 93%)'

  return (
    <svg ref={svgRef} width={w} height={h} className="cursor-default overflow-visible"
      onMouseMove={e => {
        if (!dragId.current) return
        moved.current = true
        const { x, y } = svgPos(e)
        const n = ns.find(n => n.id === dragId.current)
        if (n) { n.x = Math.max(28, Math.min(w - 28, x)); n.y = Math.max(28, Math.min(h - 28, y)); n.vx = 0; n.vy = 0 }
        rerender(c => c + 1)
      }}
      onMouseUp={() => {
        if (dragId.current) {
          const n = ns.find(n => n.id === dragId.current)
          if (n) { n.pinned = false; alpha.current = Math.max(alpha.current, 0.2) }
          if (!moved.current) { const node = ns.find(n => n.id === dragId.current); if (node) onNav(node.id, node.type) }
          dragId.current = null; moved.current = false
        }
      }}
      onMouseLeave={() => {
        if (dragId.current) { const n = ns.find(n => n.id === dragId.current); if (n) n.pinned = false; dragId.current = null }
      }}
    >
      {gEdges.map((e, i) => {
        const s = ns.find(n => n.id === e.source); const t = ns.find(n => n.id === e.target)
        if (!s || !t) return null
        return <line key={i} x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke={edgeColor} strokeWidth="1" strokeOpacity="0.8" />
      })}
      {ns.map(node => {
        const r = node.isCurrent ? 10 : node.type === 'tag' ? 6 : 7
        const label = node.label.length > 16 ? node.label.slice(0, 15) + '…' : node.label
        return (
          <g key={node.id} className="cursor-pointer"
            onMouseDown={e => { e.stopPropagation(); dragId.current = node.id; moved.current = false; const n = ns.find(n => n.id === node.id); if (n) n.pinned = true }}
          >
            {node.type === 'tag'
              ? <rect x={node.x - 6} y={node.y - 6} width={12} height={12} fill={nodeColor(node)} stroke={strokeColor(node)} strokeWidth="1.5" rx="2" transform={`rotate(45,${node.x},${node.y})`} />
              : <circle cx={node.x} cy={node.y} r={r} fill={nodeColor(node)} stroke={strokeColor(node)} strokeWidth={node.isCurrent ? 0 : 1.5} />
            }
            <text x={node.x} y={node.y + r + 11} textAnchor="middle" fontSize="8.5" fill={node.isCurrent ? currentTextColor : textColor} className="select-none pointer-events-none" fontWeight={node.isCurrent ? '600' : '400'}>
              {label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Full Garden Graph Modal ─────────────────────────────────────────────────

function FullGardenGraph({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const pages = getPages()
  const tags = getAllTags()

  const nodes: GNode[] = [
    ...pages.map(p => ({ id: `page:${p.slug}`, label: p.title, type: 'page' as const })),
    ...tags.map(t => ({ id: `tag:${t.tag}`, label: `#${t.tag}`, type: 'tag' as const })),
  ]
  const edges: GEdge[] = []
  for (const page of pages) {
    for (const link of page.wikiLinks) {
      const target = pages.find(p => p.title.toLowerCase() === link.toLowerCase() || p.slug.toLowerCase() === link.toLowerCase())
      if (target && target.slug !== page.slug) edges.push({ source: `page:${page.slug}`, target: `page:${target.slug}` })
    }
    for (const tag of page.frontmatter.tags || []) {
      edges.push({ source: `page:${page.slug}`, target: `tag:${tag}` })
    }
  }

  const handleNav = (id: string, type: 'page' | 'tag') => {
    onClose()
    if (type === 'page') navigate(`/note/${id.replace('page:', '')}`)
    else navigate(`/tag/${id.replace('tag:', '')}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-[90vw] h-[85vh] rounded-xl overflow-hidden border border-white/10" style={{ background: '#0f0d0a' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-3 z-10 border-b border-white/8" style={{ background: 'rgba(15,13,10,0.9)' }}>
          <div className="flex items-center gap-2">
            <Network size={13} className="text-amber-500/70" />
            <span className="text-[11px] text-white/50 font-mono">garden graph — {pages.length} notes · {tags.length} tags</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-[10px] text-white/30">
              <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-full bg-white/60" />page</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-500/70 rotate-45" />tag</span>
              <span className="flex items-center gap-1 text-white/25">drag to arrange · click to open</span>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors"><X size={14} /></button>
          </div>
        </div>
        {/* Graph */}
        <div className="w-full h-full flex items-center justify-center pt-10">
          <ForceGraph nodes={nodes} edges={edges} w={window.innerWidth * 0.9 - 2} h={window.innerHeight * 0.85 - 50} dark onNav={handleNav} />
        </div>
      </div>
    </div>
  )
}

// ─── Local Graph (sidebar widget) ───────────────────────────────────────────

interface Props { currentPage: Page; linked: Page[]; backlinks: Page[] }

export default function LocalGraph({ currentPage, linked, backlinks }: Props) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)

  const neighbors = [...new Map([...linked, ...backlinks].map(p => [p.slug, p])).values()].filter(p => p.slug !== currentPage.slug)

  const nodes: GNode[] = [
    { id: currentPage.slug, label: currentPage.title, type: 'page', isCurrent: true },
    ...neighbors.map(p => ({ id: p.slug, label: p.title, type: 'page' as const })),
    ...(currentPage.frontmatter.tags || []).map(t => ({ id: `tag:${t}`, label: `#${t}`, type: 'tag' as const })),
  ]
  const edges: GEdge[] = [
    ...neighbors.map(p => ({ source: currentPage.slug, target: p.slug })),
    ...(currentPage.frontmatter.tags || []).map(t => ({ source: currentPage.slug, target: `tag:${t}` })),
  ]

  const handleNav = (id: string, type: 'page' | 'tag') => {
    if (type === 'tag') navigate(`/tag/${id.replace('tag:', '')}`)
    else navigate(`/note/${id}`)
  }

  if (nodes.length <= 1 && !currentPage.frontmatter.tags?.length) {
    return <p className="text-xs text-muted-foreground/50 italic py-1">no connections yet</p>
  }

  return (
    <div className="relative">
      <button onClick={() => setExpanded(true)}
        className="absolute top-0 right-0 z-10 flex items-center gap-1 text-[9px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        title="open full garden graph">
        <Maximize2 size={10} /> <span>expand</span>
      </button>
      <ForceGraph nodes={nodes} edges={edges} w={224} h={190} onNav={handleNav} />
      {expanded && <FullGardenGraph onClose={() => setExpanded(false)} />}
    </div>
  )
}
