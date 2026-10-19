// marketing landing page for quire.wiki.
//
// purpose: explain what quire is, who it's for, and route visitors either into
// the live demo garden (/) or the in-browser builder (/build). this page
// intentionally does not depend on /content so it renders the same way even
// if a host strips the demo notes.

import { Link } from 'react-router-dom'
import {
  Sprout,
  Network,
  FileText,
  Tags,
  Search,
  Moon,
  Lock,
  GitBranch,
  Download,
  Cloud,
  ArrowRight,
  Github,
  Quote,
} from 'lucide-react'

const QUIRE_LOGO =
  'https://images.fillout.com/orgid-659236/flowpublicid-vmdahfocso/widgetid-default/4zVYBcM4dgVTtzeNJ6ytPk/pasted-image-1776525923704.png'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <FeatureGrid />
      <HowItWorks />
      <PublishingOptions />
      <ClosingCta />
      <Footer />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// header
// ─────────────────────────────────────────────────────────────────────────────

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-5 py-3">
        <Link to="/landing" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <img src={QUIRE_LOGO} alt="quire.wiki" className="w-7 h-7 object-contain opacity-85" />
          <div>
            <div className="font-serif text-base leading-none">quire.wiki</div>
            <div className="text-[9px] text-muted-foreground leading-tight mt-0.5">center for networked thought</div>
          </div>
        </Link>
        <nav className="flex items-center gap-5">
          <a href="#features" className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">
            features
          </a>
          <a href="#how" className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">
            how it works
          </a>
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            see a demo
          </Link>
          <Link
            to="/build"
            className="text-xs px-3 py-1.5 rounded-md bg-foreground text-background hover:opacity-90 transition-opacity inline-flex items-center gap-1.5"
          >
            start building
            <ArrowRight size={12} />
          </Link>
        </nav>
      </div>
    </header>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// hero
// ─────────────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="max-w-5xl mx-auto px-5 pt-20 pb-24 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-[11px] text-muted-foreground mb-7">
        <Sprout size={12} />
        a publishing engine for digital gardens
      </div>
      <h1 className="font-serif text-5xl sm:text-6xl leading-[1.05] tracking-tight mb-5 max-w-3xl mx-auto">
        publish your notes the way you actually think.
      </h1>
      <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-9">
        quire.wiki turns a folder of markdown into a fast, linked, beautiful site.
        wikilinks, backlinks, tags, a force-directed graph, and the typography of a real
        editorial product. think obsidian publish or quartz, with less setup.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/build"
          className="px-5 py-2.5 rounded-md bg-foreground text-background hover:opacity-90 transition-opacity inline-flex items-center gap-2 text-sm font-medium"
        >
          build your garden
          <ArrowRight size={14} />
        </Link>
        <Link
          to="/"
          className="px-5 py-2.5 rounded-md border border-border bg-card hover:border-foreground/40 transition-colors text-sm"
        >
          explore the demo
        </Link>
      </div>
      <p className="text-[11px] text-muted-foreground mt-6">
        no account required. edits autosave to your browser.
      </p>

      {/* visual placeholder strip showing the product feel */}
      <div className="mt-16 mx-auto max-w-3xl rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-muted/40">
          <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
          <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
          <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
          <span className="ml-3 text-[10px] text-muted-foreground font-mono">quire.wiki/@you</span>
        </div>
        <div className="grid grid-cols-[140px_1fr] min-h-[260px]">
          <aside className="border-r border-border p-3 text-[10px] text-muted-foreground space-y-1.5 bg-muted/20">
            <div className="text-[9px] uppercase tracking-widest opacity-60">pages</div>
            <div>welcome</div>
            <div>wikilinks</div>
            <div>journal/2026</div>
            <div className="opacity-60 pl-2">april</div>
            <div>projects</div>
          </aside>
          <main className="p-5 text-left">
            <h2 className="font-serif text-xl mb-1">on networked thought</h2>
            <p className="text-[11px] text-muted-foreground italic mb-3">a short essay</p>
            <p className="text-xs leading-relaxed">
              ideas grow when they connect. a note that links to{' '}
              <span className="underline decoration-dotted underline-offset-2 decoration-[hsl(var(--anno-orange))]">
                another note
              </span>{' '}
              creates a path. a garden of paths is more useful than a list of files.
            </p>
            <div className="flex gap-1.5 mt-4">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">essay</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">thought</span>
            </div>
          </main>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// features
// ─────────────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Network,
    title: 'wikilinks and backlinks',
    body: 'wrap a title in [[brackets]] to link notes. backlinks appear automatically on the linked page.',
  },
  {
    icon: GitBranch,
    title: 'force-directed graph',
    body: 'every note, tag, and edge in your garden, drawn live. drag, hover, click to navigate.',
  },
  {
    icon: FileText,
    title: 'real markdown',
    body: 'frontmatter, code fences, callouts, foldable text, mermaid diagrams, and password-locked notes.',
  },
  {
    icon: Tags,
    title: 'tags as topics',
    body: 'each tag becomes a page listing every note that uses it. colored chips, instant filtering.',
  },
  {
    icon: Search,
    title: 'search built in',
    body: 'fuzzy search across titles, content, and tags. no external service to wire up.',
  },
  {
    icon: Moon,
    title: 'light and dark',
    body: 'a paper-feeling default theme, an ink-on-charcoal dark mode, and presets in between.',
  },
  {
    icon: Lock,
    title: 'private notes',
    body: 'mark a note as password-protected and visitors get a lock screen until they unlock it.',
  },
  {
    icon: Sprout,
    title: 'browser-first builder',
    body: 'compose your garden in /build, see a live preview, and download a runnable zip.',
  },
]

function FeatureGrid() {
  return (
    <section id="features" className="border-t border-border bg-muted/20 py-20">
      <div className="max-w-5xl mx-auto px-5">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 text-center">
          what you get
        </p>
        <h2 className="font-serif text-3xl text-center mb-12 max-w-xl mx-auto leading-tight">
          everything a digital garden needs, none of the setup.
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="p-4 rounded-lg border border-border bg-card">
              <f.icon size={16} className="text-muted-foreground mb-3" />
              <h3 className="text-sm font-medium mb-1.5 leading-tight">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// how it works
// ─────────────────────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      n: '01',
      title: 'open the builder',
      body: 'go to /build. you get a profile editor, a notes list, a home page editor, and a theme picker. everything autosaves to your browser.',
    },
    {
      n: '02',
      title: 'write your notes',
      body: 'plain markdown with frontmatter. add tags, summaries, dates. cross-link with [[wikilinks]]. preview live as you type.',
    },
    {
      n: '03',
      title: 'pick a look',
      body: 'choose a preset (paper, ink, sepia, forest, mono) and slide an accent hue. tag chips and wikilink underlines pick it up.',
    },
    {
      n: '04',
      title: 'publish',
      body: 'download a zip you can host on any static server, or sign in to publish at quire.wiki/@yourhandle (coming in phase two).',
    },
  ]

  return (
    <section id="how" className="py-20 border-t border-border">
      <div className="max-w-5xl mx-auto px-5">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 text-center">
          how it works
        </p>
        <h2 className="font-serif text-3xl text-center mb-12 max-w-xl mx-auto leading-tight">
          from blank page to published garden in minutes.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map(s => (
            <div key={s.n} className="relative">
              <div className="font-serif text-3xl text-muted-foreground/30 mb-2">{s.n}</div>
              <h3 className="text-sm font-medium mb-1.5">{s.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// publishing options
// ─────────────────────────────────────────────────────────────────────────────

function PublishingOptions() {
  return (
    <section className="py-20 border-t border-border bg-muted/20">
      <div className="max-w-5xl mx-auto px-5">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 text-center">
          publishing
        </p>
        <h2 className="font-serif text-3xl text-center mb-12 max-w-xl mx-auto leading-tight">
          host with us, or take it with you.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          <div className="p-6 rounded-lg border border-border bg-card">
            <Cloud size={18} className="text-muted-foreground mb-3" />
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-medium">hosted on quire.wiki</h3>
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                soon
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              one click to publish at quire.wiki/@yourhandle. manage multiple gardens
              from a dashboard. tweak colors and tag styles in a visual theme editor.
            </p>
            <Link to="/build" className="text-xs text-foreground underline decoration-dotted underline-offset-4">
              start drafting now
            </Link>
          </div>
          <div className="p-6 rounded-lg border border-border bg-card">
            <Download size={18} className="text-muted-foreground mb-3" />
            <h3 className="text-sm font-medium mb-2">download and self-host</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              get a zip with your notes, profile, and theme baked in. drop it on
              vercel, netlify, cloudflare pages, or your own server. no lock-in.
            </p>
            <Link to="/build" className="text-xs text-foreground underline decoration-dotted underline-offset-4">
              build and export
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// closing cta + quote
// ─────────────────────────────────────────────────────────────────────────────

function ClosingCta() {
  return (
    <section className="py-24 border-t border-border">
      <div className="max-w-3xl mx-auto px-5 text-center">
        <Quote size={20} className="text-muted-foreground/50 mx-auto mb-4" />
        <p className="font-serif text-2xl leading-snug mb-3">
          a garden is a network of attention.
          <br />
          a wiki is a network of writing.
          <br />
          a quire is both.
        </p>
        <p className="text-xs text-muted-foreground mb-10">on the shape of slow software</p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/build"
            className="px-5 py-2.5 rounded-md bg-foreground text-background hover:opacity-90 transition-opacity inline-flex items-center gap-2 text-sm font-medium"
          >
            start your garden
            <ArrowRight size={14} />
          </Link>
          <Link
            to="/"
            className="px-5 py-2.5 rounded-md border border-border bg-card hover:border-foreground/40 transition-colors text-sm"
          >
            explore the demo
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// footer
// ─────────────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="max-w-5xl mx-auto px-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <img src={QUIRE_LOGO} alt="quire.wiki" className="w-5 h-5 object-contain opacity-70" />
          <span>quire.wiki, an open digital garden engine</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">demo</Link>
          <Link to="/build" className="hover:text-foreground transition-colors">builder</Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors inline-flex items-center gap-1.5"
          >
            <Github size={12} />
            source
          </a>
        </div>
      </div>
    </footer>
  )
}
