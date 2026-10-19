import React, { useState, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronUp, ChevronRight, ArrowUpRight } from 'lucide-react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Page } from './content'
import PagePreviewCard from '@/components/PagePreviewCard'
import MermaidBlock from '@/components/MermaidBlock'

// ── Media (images + video, colocated with content) ─────────
const mediaFiles = import.meta.glob('/content/**/*.{png,jpg,jpeg,gif,webp,avif,svg,mp4,webm,mov,m4v}', { query: '?url', import: 'default', eager: true }) as Record<string, string>

/** resolve a markdown media src to a built asset url; external urls pass through */
function resolveMedia(src: string): string | null {
  if (isExternal(src)) return src
  const norm = src.replace(/^[./]+/, '').replace(/^content\//, '')
  const key = Object.keys(mediaFiles).find(k => k.endsWith(norm))
  return key ? mediaFiles[key] : null
}

const VIDEO_RE = /\.(mp4|webm|mov|m4v)$/i

function MediaTag({ alt, src }: { alt: string; src: string }) {
  const resolved = resolveMedia(src)
  if (!resolved) return <span className="wiki-link-broken">missing media: {alt || src}</span>
  if (VIDEO_RE.test(resolved.split('?')[0])) {
    return <video controls playsInline src={resolved} className="md-video" />
  }
  return <img src={resolved} alt={alt} loading="lazy" className="md-image" />
}

// ── Inline Tokens ───────────────────────────────────────────
type Token =
  | { t: 'text'; v: string }
  | { t: 'bold'; v: string }
  | { t: 'italic'; v: string }
  | { t: 'code'; v: string }
  | { t: 'link'; href: string; label: string }
  | { t: 'media'; alt: string; src: string }
  | { t: 'wiki'; title: string; display?: string }
  | { t: 'fold'; visible: string; hidden: string }
  | { t: 'anno'; v: string; hl?: string; ul?: string; ulColor?: string }

function tokenizeInline(text: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  const push = (tok: Token) => tokens.push(tok)
  const last = () => tokens[tokens.length - 1]

  while (i < text.length) {
    // Fold: {fold: visible | hidden}
    if (text[i] === '{' && text.slice(i + 1, i + 6) === 'fold:') {
      const end = text.indexOf('}', i)
      if (end !== -1) {
        const inner = text.slice(i + 6, end)
        const pipe = inner.indexOf('|')
        if (pipe !== -1) {
          push({ t: 'fold', visible: inner.slice(0, pipe).trim(), hidden: inner.slice(pipe + 1).trim() })
          i = end + 1; continue
        }
      }
    }

    // Annotation: {hl:color|text}, {ul:style|text}, {ul:style:color|text}, {hl:color ul:style:color|text}
    if (text[i] === '{' && (text.startsWith('hl:', i + 1) || text.startsWith('ul:', i + 1))) {
      const end = text.indexOf('}', i)
      if (end !== -1) {
        const inner = text.slice(i + 1, end)
        const pipe = inner.indexOf('|')
        if (pipe !== -1) {
          const opts = inner.slice(0, pipe)
          const content = inner.slice(pipe + 1)
          const hlM = opts.match(/hl:(\w+)/)
          const ulM = opts.match(/ul:(\w+)(?::(\w+))?/)
          if (hlM || ulM) {
            push({ t: 'anno', v: content, hl: hlM?.[1], ul: ulM?.[1], ulColor: ulM?.[2] })
            i = end + 1; continue
          }
        }
      }
    }

    // Wiki link: [[title]] or [[title|display]]
    if (text[i] === '[' && text[i + 1] === '[') {
      const end = text.indexOf(']]', i + 2)
      if (end !== -1) {
        const inner = text.slice(i + 2, end); const pipe = inner.indexOf('|')
        push(pipe !== -1
          ? { t: 'wiki', title: inner.slice(0, pipe).trim(), display: inner.slice(pipe + 1).trim() }
          : { t: 'wiki', title: inner.trim() })
        i = end + 2; continue
      }
    }

    // Bold: **text**
    if (text[i] === '*' && text[i + 1] === '*') {
      const end = text.indexOf('**', i + 2)
      if (end !== -1) { push({ t: 'bold', v: text.slice(i + 2, end) }); i = end + 2; continue }
    }

    // Italic: *text* or _text_
    if ((text[i] === '*' || text[i] === '_') && text[i + 1] !== text[i]) {
      const ch = text[i]; const end = text.indexOf(ch, i + 1)
      if (end !== -1 && end > i + 1) { push({ t: 'italic', v: text.slice(i + 1, end) }); i = end + 1; continue }
    }

    // Inline code: `code`
    if (text[i] === '`') {
      const end = text.indexOf('`', i + 1)
      if (end !== -1) { push({ t: 'code', v: text.slice(i + 1, end) }); i = end + 1; continue }
    }

    // Media: ![alt](src) — images and video files
    if (text[i] === '!' && text[i + 1] === '[') {
      const te = text.indexOf(']', i)
      if (te !== -1 && text[te + 1] === '(') {
        const ue = text.indexOf(')', te + 2)
        if (ue !== -1) { push({ t: 'media', alt: text.slice(i + 2, te), src: text.slice(te + 2, ue) }); i = ue + 1; continue }
      }
    }

    // Link: [text](url)
    if (text[i] === '[') {
      const te = text.indexOf(']', i)
      if (te !== -1 && text[te + 1] === '(') {
        const ue = text.indexOf(')', te + 2)
        if (ue !== -1) { push({ t: 'link', label: text.slice(i + 1, te), href: text.slice(te + 2, ue) }); i = ue + 1; continue }
      }
    }

    const l = last()
    if (l && l.t === 'text') (l as { t: 'text'; v: string }).v += text[i]
    else push({ t: 'text', v: text[i] })
    i++
  }
  return tokens
}

// ── Inline Components ───────────────────────────────────────

function FoldSpan({ visible, hidden, pages }: { visible: string; hidden: string; pages: Page[] }) {
  const [open, setOpen] = useState(false)
  return (
    <span>
      <span className="fold-trigger" onClick={() => setOpen(!open)}>
        {renderTokens(tokenizeInline(visible), pages, 'fv')}
        <span className="fold-indicator">
          {open ? <ChevronUp size={9} className="inline" /> : <ChevronDown size={9} className="inline" />}
        </span>
      </span>
      {open && <span className="fold-content">{renderTokens(tokenizeInline(hidden), pages, 'fh')}</span>}
    </span>
  )
}

function WikiLink({ title, display, pages }: { title: string; display?: string; pages: Page[] }) {
  const navigate = useNavigate()
  const page = pages.find(p =>
    p.title.toLowerCase() === title.toLowerCase() ||
    p.slug.toLowerCase() === title.toLowerCase()
  )

  if (!page) {
    return <span className="wiki-link-broken">[[{display || title}]]</span>
  }

  return (
    <HoverCard openDelay={350} closeDelay={100}>
      <HoverCardTrigger asChild>
        <a className="wiki-link"
          href={`/note/${page.slug}`}
          onClick={e => { e.preventDefault(); navigate(`/note/${page.slug}`) }}>
          {display || title}
        </a>
      </HoverCardTrigger>
      <HoverCardContent className="w-72 preview-card" align="start" sideOffset={6}>
        <PagePreviewCard page={page} />
      </HoverCardContent>
    </HoverCard>
  )
}

const isExternal = (href: string) =>
  href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')

function InternalLink({ href, label, pages }: { href: string; label: string; pages: Page[] }) {
  const navigate = useNavigate()
  const match = href.match(/^\/note\/(.+)$/) || href.match(/^note\/(.+)$/)
  const slug = match?.[1]
  const page = slug ? pages.find(p => p.slug === slug || p.slug === slug.replace(/^notes\//, '')) : undefined

  if (page) {
    return (
      <HoverCard openDelay={350} closeDelay={100}>
        <HoverCardTrigger asChild>
          <a
            className="internal-link"
            href={href}
            onClick={e => { e.preventDefault(); navigate(`/note/${page.slug}`) }}
          >
            {label}
          </a>
        </HoverCardTrigger>
        <HoverCardContent className="w-72 preview-card" align="start" sideOffset={6}>
          <PagePreviewCard page={page} />
        </HoverCardContent>
      </HoverCard>
    )
  }

  return <a href={href} className="internal-link">{label}</a>
}

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="external-link">
      {label}<ArrowUpRight size={10} className="inline ml-0.5 opacity-55 -translate-y-px" />
    </a>
  )
}

function Annotation({ v, hl, ul, ulColor, pages }: { v: string; hl?: string; ul?: string; ulColor?: string; pages: Page[] }) {
  const hlCls = hl ? `anno-hl anno-hl-${hl}` : ''
  const ulCls = ul ? `anno-ul-${ul}${ulColor ? ` anno-ul-color-${ulColor}` : ''}` : ''
  const cls = [hlCls, ulCls].filter(Boolean).join(' ')
  return (
    <span className={cls || undefined}>
      {renderTokens(tokenizeInline(v), pages, `a-${v.slice(0, 6)}`)}
    </span>
  )
}

function renderTokens(tokens: Token[], pages: Page[], key: string): ReactNode {
  return <>{tokens.map((tok, i) => {
    const k = `${key}-${i}`
    if (tok.t === 'text') return <React.Fragment key={k}>{tok.v}</React.Fragment>
    if (tok.t === 'bold') return <strong key={k}>{tok.v}</strong>
    if (tok.t === 'italic') return <em key={k}>{tok.v}</em>
    if (tok.t === 'code') return <code key={k}>{tok.v}</code>
    if (tok.t === 'link') {
      return isExternal(tok.href)
        ? <ExternalLink key={k} href={tok.href} label={tok.label} />
        : <InternalLink key={k} href={tok.href} label={tok.label} pages={pages} />
    }
    if (tok.t === 'media') return <MediaTag key={k} alt={tok.alt} src={tok.src} />
    if (tok.t === 'wiki') return <WikiLink key={k} title={tok.title} display={tok.display} pages={pages} />
    if (tok.t === 'fold') return <FoldSpan key={k} visible={tok.visible} hidden={tok.hidden} pages={pages} />
    if (tok.t === 'anno') return <Annotation key={k} v={tok.v} hl={tok.hl} ul={tok.ul} ulColor={tok.ulColor} pages={pages} />
    return null
  })}</>
}

function inline(text: string, pages: Page[], key: string): ReactNode {
  return renderTokens(tokenizeInline(text), pages, key)
}

// ── Block Types ─────────────────────────────────────────────
type Block =
  | { type: 'h'; level: number; text: string; id: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'code'; lang: string; code: string }
  | { type: 'bq'; text: string }
  | { type: 'hr' }
  | { type: 'table'; header: string[]; rows: string[][] }
  | { type: 'embed'; url: string }
  | { type: 'branch'; title: string; body: string }
  | { type: 'card'; variant: string; body: string }

export function parseBlocks(content: string): Block[] {
  const blocks: Block[] = []
  const lines = content.split('\n')
  let i = 0
  let para: string[] = []
  const flushPara = () => { const t = para.join(' ').trim(); if (t) blocks.push({ type: 'p', text: t }); para = [] }

  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) { flushPara(); i++; continue }

    if (line.startsWith('```')) {
      flushPara()
      const lang = line.slice(3).trim(); const code: string[] = []; i++
      while (i < lines.length && !lines[i].startsWith('```')) { code.push(lines[i]); i++ }
      blocks.push({ type: 'code', lang, code: code.join('\n') }); i++; continue
    }
    if (line.startsWith(':::')) {
      flushPara()
      const parts = line.slice(3).trim().split(' ')
      const kind = parts[0] || 'card'; const title = parts.slice(1).join(' ')
      const body: string[] = []; i++
      while (i < lines.length && !lines[i].startsWith(':::')) { body.push(lines[i]); i++ }
      if (kind === 'branch') blocks.push({ type: 'branch', title: title || 'aside', body: body.join('\n').trim() })
      else blocks.push({ type: 'card', variant: kind, body: body.join('\n').trim() })
      i++; continue
    }
    const hm = line.match(/^(#{1,6})\s+(.+)$/)
    if (hm) {
      flushPara()
      blocks.push({ type: 'h', level: hm[1].length, text: hm[2], id: hm[2].toLowerCase().replace(/[^a-z0-9]+/g, '-') })
      i++; continue
    }
    if (/^[-*_]{3,}$/.test(line.trim())) { flushPara(); blocks.push({ type: 'hr' }); i++; continue }
    if (/^\s*\|/.test(line) && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1]) && lines[i + 1].includes('-')) {
      flushPara()
      const splitRow = (row: string) =>
        row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim())
      const header = splitRow(line); i += 2
      const rows: string[][] = []
      while (i < lines.length && /^\s*\|/.test(lines[i])) { rows.push(splitRow(lines[i])); i++ }
      blocks.push({ type: 'table', header, rows }); continue
    }
    // Video embed: a bare YouTube/Vimeo url on its own line
    if (/^https?:\/\/(www\.)?(youtube\.com\/watch\?v=\S+|youtu\.be\/\S+|vimeo\.com\/\d+\S*)$/i.test(line.trim())) {
      flushPara(); blocks.push({ type: 'embed', url: line.trim() }); i++; continue
    }
    if (line.startsWith('> ')) {
      flushPara(); const bq: string[] = []
      while (i < lines.length && lines[i].startsWith('> ')) { bq.push(lines[i].slice(2)); i++ }
      blocks.push({ type: 'bq', text: bq.join(' ') }); continue
    }
    if (/^[-*+]\s/.test(line)) {
      flushPara(); const items: string[] = []
      while (i < lines.length && /^[-*+]\s/.test(lines[i])) { items.push(lines[i].slice(2).trim()); i++ }
      blocks.push({ type: 'ul', items }); continue
    }
    if (/^\d+\.\s/.test(line)) {
      flushPara(); const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) { items.push(lines[i].replace(/^\d+\.\s/, '').trim()); i++ }
      blocks.push({ type: 'ol', items }); continue
    }
    para.push(line); i++
  }
  flushPara()
  return blocks
}

function EmbedBlock({ url }: { url: string }) {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/)
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  const src = yt ? `https://www.youtube-nocookie.com/embed/${yt[1]}` : vimeo ? `https://player.vimeo.com/video/${vimeo[1]}` : null
  if (!src) return <a href={url} target="_blank" rel="noopener noreferrer" className="external-link">{url}</a>
  return (
    <div className="embed-block">
      <iframe
        src={src}
        title="video embed"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

function BranchBlock({ title, body, pages }: { title: string; body: string; pages: Page[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="branch-block">
      <button className="branch-trigger" onClick={() => setOpen(!open)}>
        <span className="branch-icon">{open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}</span>{title}
      </button>
      {open && <div className="branch-body"><MarkdownContent content={body} pages={pages} /></div>}
    </div>
  )
}

function CardBlock({ variant, body, pages }: { variant: string; body: string; pages: Page[] }) {
  return (
    <div className={`card-block card-block--${variant}`}>
      {variant !== 'card' && <div className="card-block-label">{variant}</div>}
      <div className="card-block-body"><MarkdownContent content={body} pages={pages} /></div>
    </div>
  )
}

export function MarkdownContent({ content, pages }: { content: string; pages: Page[] }) {
  const blocks = parseBlocks(content)
  return (
    <div className="markdown-content">
      {blocks.map((block, idx) => {
        const k = `b${idx}`
        if (block.type === 'h') {
          const Tag = `h${block.level}` as 'h1' | 'h2' | 'h3' | 'h4'
          return <Tag key={k} id={block.id}>{inline(block.text, pages, k)}</Tag>
        }
        if (block.type === 'p') return <p key={k}>{inline(block.text, pages, k)}</p>
        if (block.type === 'ul') return <ul key={k}>{block.items.map((it, j) => <li key={j}>{inline(it, pages, `${k}-${j}`)}</li>)}</ul>
        if (block.type === 'ol') return <ol key={k}>{block.items.map((it, j) => <li key={j}>{inline(it, pages, `${k}-${j}`)}</li>)}</ol>
        if (block.type === 'code') {
          if (block.lang === 'mermaid') return <MermaidBlock key={k} code={block.code} />
          return <pre key={k}><code className={block.lang ? `language-${block.lang}` : ''}>{block.code}</code></pre>
        }
        if (block.type === 'bq') return <blockquote key={k}>{inline(block.text, pages, k)}</blockquote>
        if (block.type === 'table') return (
          <div key={k} className="table-wrap">
            <table>
              <thead><tr>{block.header.map((cell, j) => <th key={j}>{inline(cell, pages, `${k}-h${j}`)}</th>)}</tr></thead>
              <tbody>{block.rows.map((row, r) => (
                <tr key={r}>{row.map((cell, j) => <td key={j}>{inline(cell, pages, `${k}-${r}-${j}`)}</td>)}</tr>
              ))}</tbody>
            </table>
          </div>
        )
        if (block.type === 'hr') return <hr key={k} />
        if (block.type === 'embed') return <EmbedBlock key={k} url={block.url} />
        if (block.type === 'branch') return <BranchBlock key={k} title={block.title} body={block.body} pages={pages} />
        if (block.type === 'card') return <CardBlock key={k} variant={block.variant} body={block.body} pages={pages} />
        return null
      })}
    </div>
  )
}
