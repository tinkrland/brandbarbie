import { useEffect, useRef, useState } from 'react'
import { useMode } from '@/lib/mode'

// Singleton loader
let mermaidLoaded = false
let mermaidLoading = false
const pendingCallbacks: Array<() => void> = []

function ensureMermaid(cb: () => void) {
  if (mermaidLoaded) { cb(); return }
  pendingCallbacks.push(cb)
  if (mermaidLoading) return
  mermaidLoading = true
  const s = document.createElement('script')
  s.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js'
  s.onload = () => {
    mermaidLoaded = true
    pendingCallbacks.forEach(fn => fn())
    pendingCallbacks.length = 0
  }
  document.head.appendChild(s)
}

const themeConfig = {
  standard: {
    theme: 'base' as const,
    themeVariables: {
      primaryColor: '#e8e0d0',
      primaryBorderColor: '#b8a898',
      primaryTextColor: '#2a1f14',
      lineColor: '#7a6a58',
      secondaryColor: '#f0ebe0',
      tertiaryColor: '#f8f4ec',
      background: '#f5f0e8',
      nodeBorder: '#b8a898',
      clusterBkg: '#f0ebe0',
      titleColor: '#2a1f14',
      edgeLabelBackground: '#f5f0e8',
    },
  },
  dark: {
    theme: 'dark' as const,
    themeVariables: {
      primaryColor: '#2a2218',
      primaryBorderColor: '#5a4a38',
      primaryTextColor: '#e0d8cc',
      lineColor: '#8a7a68',
      background: '#1a1410',
    },
  },
  handwritten: {
    theme: 'base' as const,
    themeVariables: {
      primaryColor: '#dde8d5',
      primaryBorderColor: '#8aaa80',
      primaryTextColor: '#2a3020',
      lineColor: '#6a8860',
      secondaryColor: '#e8f0e0',
      tertiaryColor: '#f0f6ea',
      background: '#f2f7ec',
      nodeBorder: '#8aaa80',
      edgeLabelBackground: '#f2f7ec',
    },
  },
}

let renderCounter = 0

export default function MermaidBlock({ code }: { code: string }) {
  const { mode } = useMode()
  const ref = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    ensureMermaid(() => setReady(true))
  }, [])

  useEffect(() => {
    if (!ready || !ref.current) return
    const mermaid = (window as unknown as { mermaid: {
      initialize: (cfg: object) => void
      render: (id: string, code: string) => Promise<{ svg: string }>
    }}).mermaid

    const cfg = themeConfig[mode] || themeConfig.standard
    mermaid.initialize({ startOnLoad: false, securityLevel: 'loose', ...cfg })

    const id = `mermaid-${++renderCounter}-${Date.now()}`
    mermaid.render(id, code.trim()).then(({ svg }) => {
      if (ref.current) ref.current.innerHTML = svg
    }).catch(() => {
      if (ref.current) ref.current.innerHTML = `<pre class="mermaid-error">diagram error — check syntax</pre>`
    })
  }, [ready, code, mode])

  if (!ready) {
    return (
      <div className="my-4 flex justify-center py-6">
        <span className="text-[11px] text-muted-foreground/40 italic">rendering diagram…</span>
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className="mermaid-block my-6 flex justify-center overflow-x-auto rounded-lg border border-border/30 bg-card/60 p-4"
    />
  )
}
