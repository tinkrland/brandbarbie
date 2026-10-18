// garden state model for the landing-page builder.
//
// the public quire site reads markdown files from /content via import.meta.glob.
// the builder works on an in-memory garden object that's mirrored to localStorage
// so a visitor can refresh /landing without losing their work. when they hit
// "publish → download zip" we serialize the garden into a ready-to-run quire
// project (markdown files + profile.ts + theme override).

export type IconName = 'github' | 'twitter' | 'globe' | 'mail' | 'linkedin'

export interface GardenLink {
  label: string
  url: string
  icon: IconName
}

export interface GardenProfile {
  name: string
  handle: string
  initials: string
  avatarUrl: string
  bio: string
  links: GardenLink[]
}

export interface GardenNote {
  id: string          // stable client-side id
  slug: string        // path used in the published site, e.g. "notes/learning"
  title: string
  summary: string
  tags: string[]
  date: string        // free-form date string, matches existing frontmatter
  content: string     // markdown body (no frontmatter)
}

export interface GardenTheme {
  presetId: string
  accentHue: number   // 0-360, drives the wiki-link / tag accent
}

export interface Garden {
  profile: GardenProfile
  notes: GardenNote[]
  theme: GardenTheme
  // index page content is just a special note kept separately so the editor
  // can present it as the "home" tab without it cluttering the notes list.
  indexContent: string
  updatedAt: number
}

// ── theme presets ────────────────────────────────────────────────────────────
// each preset writes a small set of root css variables into the published site.
// kept narrow on purpose — full design-token editing is on the roadmap.

export interface ThemePreset {
  id: string
  label: string
  // css variable overrides applied in addition to the default quire theme.
  // values are raw "h s% l%" strings to match index.css conventions.
  vars: Record<string, string>
  defaultAccentHue: number
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'paper',
    label: 'paper',
    defaultAccentHue: 20,
    vars: {
      '--background': '38 30% 92%',
      '--foreground': '28 20% 13%',
      '--card': '40 32% 97%',
      '--muted': '38 22% 85%',
      '--border': '35 18% 80%',
    },
  },
  {
    id: 'ink',
    label: 'ink',
    defaultAccentHue: 210,
    vars: {
      '--background': '24 14% 9%',
      '--foreground': '36 18% 86%',
      '--card': '24 12% 11%',
      '--muted': '24 10% 15%',
      '--border': '26 10% 22%',
    },
  },
  {
    id: 'sepia',
    label: 'sepia',
    defaultAccentHue: 30,
    vars: {
      '--background': '34 35% 88%',
      '--foreground': '24 30% 18%',
      '--card': '36 38% 94%',
      '--muted': '32 25% 80%',
      '--border': '30 22% 72%',
    },
  },
  {
    id: 'forest',
    label: 'forest',
    defaultAccentHue: 145,
    vars: {
      '--background': '120 10% 95%',
      '--foreground': '155 30% 12%',
      '--card': '120 18% 98%',
      '--muted': '120 12% 86%',
      '--border': '130 12% 78%',
    },
  },
  {
    id: 'mono',
    label: 'mono',
    defaultAccentHue: 0,
    vars: {
      '--background': '0 0% 98%',
      '--foreground': '0 0% 8%',
      '--card': '0 0% 100%',
      '--muted': '0 0% 92%',
      '--border': '0 0% 84%',
    },
  },
]

// ── storage ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'quire.garden.draft.v1'

export function defaultGarden(): Garden {
  return {
    profile: {
      name: 'your name',
      handle: 'yourhandle',
      initials: 'YN',
      avatarUrl: '',
      bio: 'networked thinker',
      links: [
        { label: 'github', url: 'https://github.com/yourusername', icon: 'github' },
        { label: 'website', url: 'https://yourwebsite.com', icon: 'globe' },
      ],
    },
    notes: [
      {
        id: cryptoId(),
        slug: 'notes/welcome',
        title: 'welcome',
        summary: 'first note in your garden',
        tags: ['meta'],
        date: '',
        content:
          'this is your first note. edit me on the left, watch the preview update on the right.\n\nyou can use [[wikilinks]] and standard markdown.',
      },
      {
        id: cryptoId(),
        slug: 'notes/wikilinks',
        title: 'wikilinks',
        summary: 'how internal links work in quire',
        tags: ['meta', 'syntax'],
        date: '',
        content:
          'wrap a note title in double brackets, like [[welcome]], to create an internal link. broken links stay visible but dimmed.',
      },
    ],
    theme: { presetId: 'paper', accentHue: 20 },
    indexContent:
      '# welcome to my garden\n\na space for thinking, linking, and growing ideas.\n\nstart with [[welcome]] or browse the sidebar.',
    updatedAt: Date.now(),
  }
}

export function loadGarden(): Garden {
  if (typeof window === 'undefined') return defaultGarden()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultGarden()
    const parsed = JSON.parse(raw) as Garden
    // light validation — if shape looks wrong, fall back to defaults rather
    // than crashing the editor on an old schema.
    if (!parsed.profile || !Array.isArray(parsed.notes) || !parsed.theme) {
      return defaultGarden()
    }
    return parsed
  } catch {
    return defaultGarden()
  }
}

export function saveGarden(garden: Garden): void {
  if (typeof window === 'undefined') return
  const next = { ...garden, updatedAt: Date.now() }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export function clearGarden(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}

// ── helpers ──────────────────────────────────────────────────────────────────

function cryptoId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2, 10)
}

export function newNote(): GardenNote {
  return {
    id: cryptoId(),
    slug: `notes/untitled-${Date.now().toString(36).slice(-4)}`,
    title: 'untitled',
    summary: '',
    tags: [],
    date: '',
    content: '',
  }
}

export function getThemePreset(id: string): ThemePreset {
  return THEME_PRESETS.find(p => p.id === id) || THEME_PRESETS[0]
}

/**
 * compute all unique tags across the garden, with counts. used by the live
 * preview to render the topic strip the same way the real homepage does.
 */
export function gardenTags(garden: Garden): { tag: string; count: number }[] {
  const counts: Record<string, number> = {}
  for (const note of garden.notes) {
    for (const tag of note.tags) counts[tag] = (counts[tag] || 0) + 1
  }
  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
}

// ── frontmatter serialization ────────────────────────────────────────────────
// kept loose to mirror src/lib/content.ts's frontmatter parser, which itself
// is intentionally minimal (no full yaml engine). if a field is empty we omit
// it so the resulting markdown stays clean.

export function noteToMarkdown(note: GardenNote): string {
  const fm: string[] = ['---']
  fm.push(`title: ${note.title}`)
  if (note.tags.length) fm.push(`tags: [${note.tags.join(', ')}]`)
  if (note.date) fm.push(`date: ${note.date}`)
  if (note.summary) fm.push(`summary: ${note.summary}`)
  fm.push('---', '')
  return fm.join('\n') + note.content + (note.content.endsWith('\n') ? '' : '\n')
}

export function indexToMarkdown(garden: Garden): string {
  return `---\ntitle: ${garden.profile.name}'s garden\n---\n\n${garden.indexContent}\n`
}

export function profileToTs(profile: GardenProfile): string {
  // matches the existing src/lib/profile.ts shape so the exported zip is a
  // drop-in replacement.
  const linksJson = JSON.stringify(profile.links, null, 2)
    .split('\n')
    .map((line, i) => (i === 0 ? line : '  ' + line))
    .join('\n')
  return `// generated by quire builder. edit freely after export.

export const profile = {
  name: ${JSON.stringify(profile.name)},
  handle: ${JSON.stringify(profile.handle)},
  initials: ${JSON.stringify(profile.initials)},
  avatarUrl: ${JSON.stringify(profile.avatarUrl)},
  bio: ${JSON.stringify(profile.bio)},
  links: ${linksJson} as { label: string; url: string; icon: 'github' | 'twitter' | 'globe' | 'mail' | 'linkedin' }[],
}
`
}

/**
 * generate a small theme override stylesheet that the exported project can
 * import after index.css to apply preset + accent customizations without
 * editing the base design tokens.
 */
export function themeToCss(theme: GardenTheme): string {
  const preset = getThemePreset(theme.presetId)
  const lines: string[] = [
    '/* generated by quire builder. preset: ' + preset.label + ' */',
    ':root {',
  ]
  for (const [key, value] of Object.entries(preset.vars)) {
    lines.push(`  ${key}: ${value};`)
  }
  // accent hue drives the orange-ish wiki-link variable. saturation/lightness
  // are kept fixed so dark and light themes both stay legible.
  lines.push(`  --anno-orange: ${theme.accentHue} 60% 60%;`)
  lines.push('}')
  return lines.join('\n') + '\n'
}
