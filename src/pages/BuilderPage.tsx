// builder page, mounted at /build.
//
// layout: editor on the left, live preview on the right. the preview is a
// simulated quire frame (sidebar + content + tag chips) bound to the same
// garden state the editor mutates. nothing here touches /content or the real
// content.ts loader, so the builder runs before the user has a backend or
// any persisted gardens.

import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Trash2,
  Download,
  Cloud,
  RotateCcw,
  Github,
  Twitter,
  Globe,
  Mail,
  Linkedin,
  ExternalLink,
  Eye,
  Pencil,
  ArrowLeft,
} from 'lucide-react'
import {
  Garden,
  GardenNote,
  THEME_PRESETS,
  defaultGarden,
  gardenTags,
  getThemePreset,
  loadGarden,
  newNote,
  saveGarden,
  clearGarden,
} from '@/lib/garden'
import { buildExportZip, triggerDownload } from '@/lib/exportZip'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const ICON_MAP = {
  github: Github,
  twitter: Twitter,
  globe: Globe,
  mail: Mail,
  linkedin: Linkedin,
} as const

const TAG_COLORS = [
  'bg-amber-100 text-amber-800',
  'bg-rose-100 text-rose-800',
  'bg-emerald-100 text-emerald-800',
  'bg-sky-100 text-sky-800',
  'bg-violet-100 text-violet-800',
  'bg-orange-100 text-orange-800',
]
function tagColor(tag: string) {
  let h = 0
  for (const c of tag) h = (h * 31 + c.charCodeAt(0)) % TAG_COLORS.length
  return TAG_COLORS[h]
}

export default function BuilderPage() {
  const [garden, setGarden] = useState<Garden>(() => loadGarden())
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [publishOpen, setPublishOpen] = useState(false)

  // persist on every change. debounced lightly via rAF to avoid hammering
  // localStorage during keystrokes.
  const saveTimer = useRef<number | null>(null)
  useEffect(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => saveGarden(garden), 250)
    return () => { if (saveTimer.current) window.clearTimeout(saveTimer.current) }
  }, [garden])

  return (
    <div className="min-h-screen bg-background">
      {/* top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-center gap-3">
            <Link to="/landing" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-xs">
              <ArrowLeft size={13} />
              back
            </Link>
            <div className="h-4 w-px bg-border" />
            <div>
              <h1 className="font-serif text-base leading-tight">build your garden</h1>
              <p className="text-[11px] text-muted-foreground leading-tight">
                edits autosave to this browser. nothing is uploaded.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm('reset the builder to defaults? this clears your draft.')) {
                  clearGarden()
                  setGarden(defaultGarden())
                  setActiveNoteId(null)
                }
              }}
            >
              <RotateCcw size={13} />
              reset
            </Button>
            <Button size="sm" onClick={() => setPublishOpen(true)}>
              <Cloud size={13} />
              publish
            </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* ── editor pane ──────────────────────────────────────────────── */}
        <section className="border-r border-border min-h-[calc(100vh-57px)]">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-3 h-auto">
              <TabsTrigger value="profile" className="text-xs">profile</TabsTrigger>
              <TabsTrigger value="notes" className="text-xs">notes</TabsTrigger>
              <TabsTrigger value="home" className="text-xs">home page</TabsTrigger>
              <TabsTrigger value="theme" className="text-xs">theme</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="p-5 mt-0">
              <ProfileEditor garden={garden} setGarden={setGarden} />
            </TabsContent>
            <TabsContent value="notes" className="mt-0">
              <NotesEditor
                garden={garden}
                setGarden={setGarden}
                activeNoteId={activeNoteId}
                setActiveNoteId={setActiveNoteId}
              />
            </TabsContent>
            <TabsContent value="home" className="p-5 mt-0">
              <HomeEditor garden={garden} setGarden={setGarden} />
            </TabsContent>
            <TabsContent value="theme" className="p-5 mt-0">
              <ThemeEditor garden={garden} setGarden={setGarden} />
            </TabsContent>
          </Tabs>
        </section>

        {/* ── live preview pane ────────────────────────────────────────── */}
        <section className="bg-muted/30 sticky top-[57px] h-[calc(100vh-57px)] overflow-hidden">
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground bg-background/80 backdrop-blur px-2 py-1 rounded">
            <Eye size={10} />
            live preview
          </div>
          <PreviewFrame garden={garden} />
        </section>
      </div>

      <PublishDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        garden={garden}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// profile editor
// ─────────────────────────────────────────────────────────────────────────────

function ProfileEditor({
  garden,
  setGarden,
}: {
  garden: Garden
  setGarden: (g: Garden) => void
}) {
  const p = garden.profile
  const update = (patch: Partial<typeof p>) =>
    setGarden({ ...garden, profile: { ...p, ...patch } })

  return (
    <div className="space-y-5 max-w-md">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
          identity
        </p>
        <div className="space-y-3">
          <Field label="name">
            <Input value={p.name} onChange={e => update({ name: e.target.value })} />
          </Field>
          <Field label="handle">
            <Input
              value={p.handle}
              onChange={e => update({ handle: e.target.value.replace(/[^a-z0-9_-]/gi, '').toLowerCase() })}
              placeholder="lowercase, no spaces"
            />
          </Field>
          <Field label="initials">
            <Input
              value={p.initials}
              maxLength={3}
              onChange={e => update({ initials: e.target.value.toUpperCase() })}
            />
          </Field>
          <Field label="avatar url (optional)">
            <Input
              value={p.avatarUrl}
              onChange={e => update({ avatarUrl: e.target.value })}
              placeholder="https://..."
            />
          </Field>
          <Field label="bio">
            <Textarea
              value={p.bio}
              onChange={e => update({ bio: e.target.value })}
              rows={2}
            />
          </Field>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">links</p>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              update({
                links: [...p.links, { label: 'new link', url: 'https://', icon: 'globe' }],
              })
            }
          >
            <Plus size={12} />
            add link
          </Button>
        </div>
        <div className="space-y-2">
          {p.links.map((link, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-card rounded border border-border">
              <select
                className="text-xs bg-transparent border border-border rounded px-1.5 py-1"
                value={link.icon}
                onChange={e => {
                  const next = [...p.links]
                  next[i] = { ...link, icon: e.target.value as typeof link.icon }
                  update({ links: next })
                }}
              >
                {Object.keys(ICON_MAP).map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
              <Input
                value={link.label}
                placeholder="label"
                className="h-8 text-xs"
                onChange={e => {
                  const next = [...p.links]
                  next[i] = { ...link, label: e.target.value }
                  update({ links: next })
                }}
              />
              <Input
                value={link.url}
                placeholder="url"
                className="h-8 text-xs"
                onChange={e => {
                  const next = [...p.links]
                  next[i] = { ...link, url: e.target.value }
                  update({ links: next })
                }}
              />
              <button
                onClick={() => update({ links: p.links.filter((_, j) => j !== i) })}
                className="text-muted-foreground hover:text-destructive transition-colors p-1"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          {p.links.length === 0 && (
            <p className="text-xs text-muted-foreground italic">no links yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// notes editor
// ─────────────────────────────────────────────────────────────────────────────

function NotesEditor({
  garden,
  setGarden,
  activeNoteId,
  setActiveNoteId,
}: {
  garden: Garden
  setGarden: (g: Garden) => void
  activeNoteId: string | null
  setActiveNoteId: (id: string | null) => void
}) {
  const active = useMemo(
    () => garden.notes.find(n => n.id === activeNoteId) || null,
    [garden.notes, activeNoteId],
  )

  const updateNote = (patch: Partial<GardenNote>) => {
    if (!active) return
    setGarden({
      ...garden,
      notes: garden.notes.map(n => (n.id === active.id ? { ...n, ...patch } : n)),
    })
  }

  const addNote = () => {
    const note = newNote()
    setGarden({ ...garden, notes: [...garden.notes, note] })
    setActiveNoteId(note.id)
  }

  const deleteNote = (id: string) => {
    setGarden({ ...garden, notes: garden.notes.filter(n => n.id !== id) })
    if (activeNoteId === id) setActiveNoteId(null)
  }

  return (
    <div className="grid grid-cols-[200px_1fr] min-h-[calc(100vh-110px)]">
      {/* note list */}
      <div className="border-r border-border bg-muted/30">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {garden.notes.length} note{garden.notes.length === 1 ? '' : 's'}
          </p>
          <button
            onClick={addNote}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="add note"
          >
            <Plus size={13} />
          </button>
        </div>
        <div className="p-1">
          {garden.notes.map(note => (
            <button
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className={`group w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between gap-2 transition-colors ${
                activeNoteId === note.id
                  ? 'bg-foreground/8 text-foreground'
                  : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
              }`}
            >
              <span className="truncate">{note.title || 'untitled'}</span>
              <Trash2
                size={11}
                onClick={e => {
                  e.stopPropagation()
                  deleteNote(note.id)
                }}
                className="opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:text-destructive transition-opacity flex-shrink-0"
              />
            </button>
          ))}
          {garden.notes.length === 0 && (
            <p className="text-xs text-muted-foreground italic px-2 py-3">no notes yet</p>
          )}
        </div>
      </div>

      {/* note editor */}
      <div className="p-5">
        {!active ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
            <Pencil size={20} className="mb-2 opacity-40" />
            <p className="text-xs">select a note to edit, or add a new one</p>
          </div>
        ) : (
          <div className="space-y-3 max-w-xl">
            <Field label="title">
              <Input value={active.title} onChange={e => updateNote({ title: e.target.value })} />
            </Field>
            <Field label="slug (path in your garden)">
              <Input
                value={active.slug}
                onChange={e =>
                  updateNote({
                    slug: e.target.value.replace(/[^a-z0-9/_-]/gi, '').toLowerCase(),
                  })
                }
                placeholder="notes/my-note"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="date (optional)">
                <Input
                  value={active.date}
                  onChange={e => updateNote({ date: e.target.value })}
                  placeholder="2026-04-28"
                />
              </Field>
              <Field label="tags (comma separated)">
                <Input
                  value={active.tags.join(', ')}
                  onChange={e =>
                    updateNote({
                      tags: e.target.value
                        .split(',')
                        .map(t => t.trim().toLowerCase())
                        .filter(Boolean),
                    })
                  }
                />
              </Field>
            </div>
            <Field label="summary (optional)">
              <Input value={active.summary} onChange={e => updateNote({ summary: e.target.value })} />
            </Field>
            <Field label="content (markdown)">
              <Textarea
                value={active.content}
                onChange={e => updateNote({ content: e.target.value })}
                rows={14}
                className="font-mono text-xs"
              />
            </Field>
            <p className="text-[10px] text-muted-foreground">
              wikilinks: <code className="bg-muted px-1 rounded">[[note title]]</code>. headings, lists,
              code fences, blockquotes all work.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// home page editor
// ─────────────────────────────────────────────────────────────────────────────

function HomeEditor({
  garden,
  setGarden,
}: {
  garden: Garden
  setGarden: (g: Garden) => void
}) {
  return (
    <div className="space-y-3 max-w-xl">
      <Field label="home page content (markdown)">
        <Textarea
          value={garden.indexContent}
          onChange={e => setGarden({ ...garden, indexContent: e.target.value })}
          rows={16}
          className="font-mono text-xs"
        />
      </Field>
      <p className="text-[10px] text-muted-foreground">
        this is what visitors see at the root of your garden.
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// theme editor
// ─────────────────────────────────────────────────────────────────────────────

function ThemeEditor({
  garden,
  setGarden,
}: {
  garden: Garden
  setGarden: (g: Garden) => void
}) {
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">preset</p>
        <div className="grid grid-cols-3 gap-2">
          {THEME_PRESETS.map(preset => {
            const active = preset.id === garden.theme.presetId
            return (
              <button
                key={preset.id}
                onClick={() =>
                  setGarden({
                    ...garden,
                    theme: { presetId: preset.id, accentHue: preset.defaultAccentHue },
                  })
                }
                className={`p-3 rounded border transition-all text-left ${
                  active ? 'border-foreground ring-1 ring-foreground' : 'border-border hover:border-foreground/40'
                }`}
                style={{
                  background: `hsl(${preset.vars['--background']})`,
                  color: `hsl(${preset.vars['--foreground']})`,
                }}
              >
                <div className="text-xs font-medium">{preset.label}</div>
                <div className="flex gap-1 mt-2">
                  {Object.values(preset.vars).slice(0, 4).map((v, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full"
                      style={{ background: `hsl(${v})` }}
                    />
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
          accent hue ({Math.round(garden.theme.accentHue)}°)
        </p>
        <input
          type="range"
          min={0}
          max={360}
          value={garden.theme.accentHue}
          onChange={e =>
            setGarden({
              ...garden,
              theme: { ...garden.theme, accentHue: Number(e.target.value) },
            })
          }
          className="w-full"
          style={{
            background:
              'linear-gradient(to right, hsl(0 60% 60%), hsl(60 60% 60%), hsl(120 60% 60%), hsl(180 60% 60%), hsl(240 60% 60%), hsl(300 60% 60%), hsl(360 60% 60%))',
            height: 8,
            borderRadius: 4,
            appearance: 'none',
          }}
        />
        <p className="text-[10px] text-muted-foreground mt-2">
          drives wikilink underlines and tag highlights.
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// preview
// ─────────────────────────────────────────────────────────────────────────────

function PreviewFrame({ garden }: { garden: Garden }) {
  const preset = getThemePreset(garden.theme.presetId)
  const tags = gardenTags(garden)

  // apply theme variables in a scoped wrapper. we can't override the root
  // tokens (they're used by the editor itself), so we re-declare them on a
  // div and rely on tailwind's hsl(var(--…)) lookups inheriting through it.
  const previewStyle: React.CSSProperties = {
    ...Object.fromEntries(
      Object.entries(preset.vars).map(([k, v]) => [k, v]),
    ),
    ['--anno-orange' as string]: `${garden.theme.accentHue} 60% 60%`,
    background: `hsl(${preset.vars['--background']})`,
    color: `hsl(${preset.vars['--foreground']})`,
  }

  const initials = (garden.profile.initials ||
    garden.profile.name.split(' ').map(w => w[0]).join('')).slice(0, 2).toUpperCase()

  return (
    <div className="h-full overflow-auto" style={previewStyle}>
      <div className="grid grid-cols-[180px_1fr] min-h-full">
        {/* mock sidebar */}
        <aside
          className="flex flex-col"
          style={{
            background: 'hsl(28 18% 11%)',
            color: 'hsl(38 25% 88%)',
          }}
        >
          <div className="p-3 border-b" style={{ borderColor: 'hsl(28 12% 18%)' }}>
            <div className="font-serif text-sm">{garden.profile.name}'s garden</div>
            <div className="text-[9px] opacity-50">via quire.wiki</div>
          </div>
          <div className="flex-1 p-2 overflow-auto">
            <p className="text-[9px] uppercase tracking-widest opacity-30 px-1.5 mb-1.5">pages</p>
            <div className="space-y-0.5">
              {garden.notes.map(note => (
                <div
                  key={note.id}
                  className="text-[11px] px-1.5 py-1 rounded truncate"
                  style={{ color: 'hsl(38 25% 88% / 0.7)' }}
                >
                  {note.title || 'untitled'}
                </div>
              ))}
              {garden.notes.length === 0 && (
                <p className="text-[10px] opacity-30 italic px-1.5">no notes</p>
              )}
            </div>
          </div>
          {/* profile chip */}
          <div
            className="flex items-center gap-2 p-2.5 border-t"
            style={{ borderColor: 'hsl(28 12% 18%)' }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold overflow-hidden flex-shrink-0"
              style={{ background: 'hsl(28 15% 17%)', color: 'hsl(38 25% 88% / 0.7)' }}
            >
              {garden.profile.avatarUrl ? (
                <img src={garden.profile.avatarUrl} alt={garden.profile.name} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-medium truncate" style={{ color: 'hsl(38 25% 88% / 0.85)' }}>
                {garden.profile.name}
              </div>
              <div className="text-[9px] opacity-40 truncate">@{garden.profile.handle}</div>
            </div>
          </div>
        </aside>

        {/* mock content */}
        <main className="p-6 overflow-auto">
          <article className="max-w-md">
            <h1 className="font-serif text-2xl mb-1">{garden.profile.name}'s garden</h1>
            {garden.profile.bio && (
              <p className="text-xs italic opacity-70 mb-4">{garden.profile.bio}</p>
            )}
            <hr className="mb-4" style={{ borderColor: `hsl(${preset.vars['--border']})` }} />

            <div className="markdown-content text-sm">
              <MiniMarkdown source={garden.indexContent} />
            </div>

            {tags.length > 0 && (
              <div className="mt-6">
                <p className="text-[9px] uppercase tracking-widest opacity-50 mb-2">topics</p>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(({ tag, count }) => (
                    <span
                      key={tag}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tagColor(tag)}`}
                    >
                      {tag} <span className="opacity-60">{count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {garden.notes.length > 0 && (
              <div className="mt-6">
                <p className="text-[9px] uppercase tracking-widest opacity-50 mb-2">notes</p>
                <div className="space-y-1.5">
                  {garden.notes.slice(0, 5).map(note => (
                    <div
                      key={note.id}
                      className="p-2.5 rounded border text-xs"
                      style={{
                        background: `hsl(${preset.vars['--card']})`,
                        borderColor: `hsl(${preset.vars['--border']})`,
                      }}
                    >
                      <div className="font-medium">{note.title || 'untitled'}</div>
                      {note.summary && (
                        <div className="text-[11px] opacity-60 mt-0.5">{note.summary}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {garden.profile.links.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                {garden.profile.links.map((link, i) => {
                  const Icon = ICON_MAP[link.icon] || Globe
                  return (
                    <span key={i} className="flex items-center gap-1 text-[11px] opacity-70">
                      <Icon size={11} />
                      {link.label}
                      <ExternalLink size={9} className="opacity-50" />
                    </span>
                  )
                })}
              </div>
            )}
          </article>
        </main>
      </div>
    </div>
  )
}

// tiny markdown renderer for the preview only — keeps the editor pane
// independent of the production markdown pipeline so we don't accidentally
// surface engine bugs while the user is composing.
function MiniMarkdown({ source }: { source: string }) {
  const lines = source.split('\n')
  const out: React.ReactNode[] = []
  lines.forEach((line, i) => {
    if (/^#\s/.test(line)) out.push(<h1 key={i}>{line.replace(/^#\s/, '')}</h1>)
    else if (/^##\s/.test(line)) out.push(<h2 key={i}>{line.replace(/^##\s/, '')}</h2>)
    else if (/^>\s/.test(line)) out.push(<blockquote key={i}>{line.replace(/^>\s/, '')}</blockquote>)
    else if (line.trim() === '') out.push(<br key={i} />)
    else {
      // inline wikilinks rendered as plain styled text
      const parts = line.split(/(\[\[[^\]]+\]\])/g)
      out.push(
        <p key={i}>
          {parts.map((part, j) =>
            part.startsWith('[[') ? (
              <span key={j} className="wiki-link">{part.slice(2, -2).split('|')[0]}</span>
            ) : (
              <span key={j}>{part}</span>
            ),
          )}
        </p>,
      )
    }
  })
  return <>{out}</>
}

// ─────────────────────────────────────────────────────────────────────────────
// publish dialog
// ─────────────────────────────────────────────────────────────────────────────

function PublishDialog({
  open,
  onOpenChange,
  garden,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  garden: Garden
}) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const blob = await buildExportZip(garden)
      const safeHandle = (garden.profile.handle || 'garden').replace(/[^a-z0-9-]/gi, '')
      triggerDownload(blob, `quire-garden-${safeHandle}.zip`)
      toast.success('zip downloaded. unzip and run npm install && npm run dev')
    } catch (err) {
      console.error(err)
      toast.error('export failed. check the console for details.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>publish your garden</DialogTitle>
          <DialogDescription>
            two ways to put this online. you can do both later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {/* hosted publish — placeholder for phase 2 */}
          <div className="p-4 rounded border border-border bg-muted/30 opacity-70">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Cloud size={14} />
                  host on quire.wiki
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  publish to quire.wiki/@{garden.profile.handle || 'yourhandle'} with one click.
                </p>
              </div>
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground bg-background px-1.5 py-0.5 rounded">
                soon
              </span>
            </div>
            <Button size="sm" variant="outline" disabled className="mt-3">
              sign in to publish
            </Button>
            <p className="text-[10px] text-muted-foreground mt-2">
              accounts open in phase 2. your draft is saved locally until then.
            </p>
          </div>

          {/* zip export — fully working today */}
          <div className="p-4 rounded border border-border bg-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Download size={14} />
                  download zip and self-host
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  get a zip with your notes, profile, and theme baked in. drop it on
                  any static host (vercel, netlify, your own server).
                </p>
              </div>
            </div>
            <Button size="sm" onClick={handleDownload} disabled={downloading} className="mt-3">
              {downloading ? 'building...' : 'download zip'}
            </Button>
            <p className="text-[10px] text-muted-foreground mt-2">
              see <code className="bg-muted px-1 rounded">README.md</code> inside the
              zip for run instructions.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
