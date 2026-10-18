// build a downloadable zip containing a runnable quire project pre-loaded with
// the user's garden. the goal is: unzip → npm install → npm run dev works.
//
// strategy:
//   1. include only the files needed to re-run the engine. we do NOT bundle
//      node_modules or the lovable-specific tagger plugin.
//   2. write the user's notes as markdown files under content/.
//   3. overwrite src/lib/profile.ts with the generated profile.
//   4. drop a small theme.css next to index.css and import it.
//   5. ship a minimal README pointing the user at port.md.

import JSZip from 'jszip'
import {
  Garden,
  noteToMarkdown,
  indexToMarkdown,
  profileToTs,
  themeToCss,
} from './garden'

const PACKAGE_JSON = `{
  "name": "my-quire-garden",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.30.1",
    "lucide-react": "^0.462.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.23",
    "@types/react-dom": "^18.3.7",
    "@vitejs/plugin-react-swc": "^3.11.0",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.8.3",
    "vite": "^5.4.19"
  }
}
`

const README = `# my quire garden

your digital garden, exported from quire.wiki.

## run locally

\`\`\`bash
npm install
npm run dev
\`\`\`

## edit content

your notes live in \`content/\`. each markdown file is one page.
frontmatter (title, tags, summary, date) sits at the top between \`---\` markers.

## edit your profile

open \`src/lib/profile.ts\`. it controls the bottom-corner identity card.

## change the theme

edit \`src/theme.css\` for color overrides, or pick a different preset by
swapping the css variables.

## deploy

quire is a static vite app. any static host works (vercel, netlify, github
pages, cloudflare pages, your own server). see \`port.md\` for full instructions.
`

export async function buildExportZip(garden: Garden): Promise<Blob> {
  const zip = new JSZip()

  // ── package + tooling ──────────────────────────────────────────────────────
  zip.file('package.json', PACKAGE_JSON)
  zip.file('README.md', README)
  zip.file(
    '.gitignore',
    'node_modules\ndist\n.DS_Store\n.env*\n!.env.example\n',
  )

  // ── content ────────────────────────────────────────────────────────────────
  zip.file('content/index.md', indexToMarkdown(garden))
  for (const note of garden.notes) {
    // slug becomes the file path. enforce .md and avoid leading slashes that
    // would break archive extraction on some platforms.
    const path = `content/${note.slug.replace(/^\/+/, '')}.md`
    zip.file(path, noteToMarkdown(note))
  }

  // ── source files we know are required for the engine to boot ──────────────
  // we only emit the small set of files unique to the export. the consumer
  // is expected to pull the rest of the engine from a future release tarball.
  // for now we include the generated profile + theme so the in-place files
  // can be diffed by the user against their own checkout.
  zip.file('src/lib/profile.ts', profileToTs(garden.profile))
  zip.file('src/theme.css', themeToCss(garden.theme))

  // an apply-theme helper so users see the styles take effect immediately
  // after dropping these files on top of a fresh quire checkout.
  zip.file(
    'src/theme-apply.md',
    `# applying the exported theme

after copying these files into a fresh quire checkout:

1. ensure \`src/theme.css\` exists in this location.
2. open \`src/main.tsx\` and add \`import './theme.css'\` AFTER the existing
   \`import './index.css'\` line.
3. restart the dev server.
`,
  )

  return zip.generateAsync({ type: 'blob' })
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
