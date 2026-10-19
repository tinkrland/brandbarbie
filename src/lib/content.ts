export interface Frontmatter {
  title?: string
  tags?: string[]
  date?: string
  summary?: string
  cover?: string
  draft?: boolean
  password?: string
  order?: number
}

export interface Page {
  slug: string
  filePath: string
  title: string
  frontmatter: Frontmatter
  content: string
  wikiLinks: string[]
}

export interface TreeNode {
  name: string
  slug?: string
  children: TreeNode[]
  isFolder: boolean
  order?: number
}

const rawFiles = import.meta.glob('/content/**/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

function parseFrontmatter(raw: string): { frontmatter: Frontmatter; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { frontmatter: {}, content: raw }
  const yamlStr = match[1]
  const content = match[2]
  const fm: Frontmatter = {}
  for (const line of yamlStr.split('\n')) {
    const kv = line.match(/^(\w+):\s*(.+)$/)
    if (!kv) continue
    const [, key, value] = kv
    const v = value.trim().replace(/^["']|["']$/g, '')
    if (key === 'order') {
      const n = parseFloat(v)
      if (!Number.isNaN(n)) fm.order = n
    } else if (key === 'tags') {
      fm.tags = v.replace(/[\[\]]/g, '').split(',').map(t => t.trim()).filter(Boolean)
    } else if (key === 'draft') {
      fm.draft = v === 'true'
    } else {
      (fm as Record<string, unknown>)[key] = v
    }
  }
  return { frontmatter: fm, content }
}

function extractWikiLinks(content: string): string[] {
  const matches = [...content.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)]
  return [...new Set(matches.map(m => m[1].trim()))]
}

function slugFromPath(path: string): string {
  return path.replace(/^\/content\//, '').replace(/\.md$/, '').replace(/\/index$/, '') || 'index'
}

let _pages: Page[] | null = null

export function getPages(): Page[] {
  if (_pages) return _pages
  _pages = Object.entries(rawFiles)
    .filter(([path]) => !path.includes('/.'))
    .map(([path, raw]) => {
      const { frontmatter, content } = parseFrontmatter(raw)
      const slug = slugFromPath(path)
      const wikiLinks = extractWikiLinks(content)
      const title = frontmatter.title || slug.split('/').pop()?.replace(/-/g, ' ') || slug
      return { slug, filePath: path, title, frontmatter, content, wikiLinks }
    })
    .filter(p => !p.frontmatter.draft)
  return _pages
}

export function getPage(slug: string): Page | undefined {
  return getPages().find(p => p.slug === slug)
}

export function getBacklinks(slug: string): Page[] {
  const page = getPage(slug)
  if (!page) return []
  return getPages().filter(p =>
    p.slug !== slug &&
    p.wikiLinks.some(l => l.toLowerCase() === page.title.toLowerCase() || l.toLowerCase() === slug.toLowerCase())
  )
}

export function getLinkedPages(slug: string): Page[] {
  const page = getPage(slug)
  if (!page) return []
  const pages = getPages()
  return page.wikiLinks
    .map(link => pages.find(p => p.title.toLowerCase() === link.toLowerCase() || p.slug.toLowerCase() === link.toLowerCase()))
    .filter((p): p is Page => p !== undefined && p.slug !== slug)
}

export function buildTree(): TreeNode {
  const root: TreeNode = { name: 'root', children: [], isFolder: true }
  for (const page of getPages()) {
    if (page.slug === 'index') continue
    const parts = page.slug.split('/')
    let node = root
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isLast = i === parts.length - 1
      if (isLast) {
        node.children.push({ name: page.title, slug: page.slug, children: [], isFolder: false, order: page.frontmatter.order })
      } else {
        let folder = node.children.find(c => c.isFolder && c.name === part)
        if (!folder) {
          folder = { name: part, children: [], isFolder: true }
          node.children.push(folder)
        }
        node = folder
      }
    }
  }
  // a folder's order is the smallest order among its children, so putting
  // `order: n` on a folder's lead page positions the folder itself
  const nodeOrder = (n: TreeNode): number =>
    n.isFolder ? (n.children.length ? Math.min(...n.children.map(nodeOrder)) : Infinity) : (n.order ?? Infinity)

  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1
      const oa = nodeOrder(a); const ob = nodeOrder(b)
      return oa === ob ? a.name.localeCompare(b.name) : oa - ob
    })
    nodes.forEach(n => sortNodes(n.children))
  }
  sortNodes(root.children)
  return root
}

export function getAllTags(): { tag: string; count: number }[] {
  const counts: Record<string, number> = {}
  for (const page of getPages()) for (const tag of page.frontmatter.tags || []) counts[tag] = (counts[tag] || 0) + 1
  return Object.entries(counts).map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count)
}

export function getPagesByTag(tag: string): Page[] {
  return getPages().filter(p => p.frontmatter.tags?.includes(tag))
}

export function extractTOC(content: string): { level: number; text: string; id: string }[] {
  return content.split('\n').flatMap(line => {
    const m = line.match(/^(#{1,4})\s+(.+)$/)
    if (!m) return []
    return [{ level: m[1].length, text: m[2], id: m[2].toLowerCase().replace(/[^a-z0-9]+/g, '-') }]
  })
}

export function searchPages(query: string): Page[] {
  if (!query.trim()) return []
  const q = query.toLowerCase()
  return getPages().filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.content.toLowerCase().includes(q) ||
    p.frontmatter.tags?.some(t => t.toLowerCase().includes(q))
  )
}

/** Strip markdown syntax and return a plain-text excerpt */
export function getExcerpt(content: string, maxLen = 140): string {
  const stripped = content
    .replace(/\{fold:[^|]+\|([^}]+)\}/g, '$1')
    .replace(/\{(?:hl|ul):[^|]+\|([^}]+)\}/g, '$1')
    .replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, '$1')
    .replace(/:::[\s\S]*?:::/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^#{1,6}\s+.+$/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`[^`]+`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[-*+]\s/gm, '')
    .replace(/^\d+\.\s/gm, '')
    .replace(/^>\s/gm, '')
    .trim()
    .replace(/\n+/g, ' ')
    .trim()
  return stripped.length > maxLen ? stripped.slice(0, maxLen).trimEnd() + '…' : stripped
}

/** Returns prev/next pages in tree-traversal order */
export function getAdjacentPages(slug: string): { prev?: Page; next?: Page } {
  const tree = buildTree()
  const order: string[] = []
  function traverse(nodes: TreeNode[]) {
    for (const n of nodes) {
      if (!n.isFolder && n.slug) order.push(n.slug)
      else traverse(n.children)
    }
  }
  traverse(tree.children)
  const idx = order.indexOf(slug)
  if (idx === -1) return {}
  return {
    prev: idx > 0 ? getPage(order[idx - 1]) : undefined,
    next: idx < order.length - 1 ? getPage(order[idx + 1]) : undefined,
  }
}
