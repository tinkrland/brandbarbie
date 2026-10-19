# features.md

## content

- markdown rendering with custom inline and block parsers
- frontmatter support (title, tags, date, summary, cover, password, draft, order)
- wiki-links with `[[title]]` and `[[title|display text]]` syntax
- images and video files colocated in `content/`, embedded with `![alt](path)`
- youtube and vimeo links on their own line render as embedded players
- sidebar tree order controlled by frontmatter `order` (a folder is ordered by its lead page)
- automatic backlinks
- tag pages listing all notes that use a tag
- folder-based sidebar tree
- search across titles, content, and tags
- excerpts generated automatically when no summary is set
- prev and next navigation between notes in tree order

## interaction

- hover preview cards on every wiki-link and internal link
- collapsible folders in the sidebar
- collapsible left sidebar (full and icon-strip modes)
- foldable inline text using `{fold: visible | hidden}` syntax
- annotation marks (highlights and underlines) using `{hl:color|text}` and `{ul:style:color|text}`
- callout blocks (`:::note`, `:::warning`, `:::tip`)
- branch (accordion) blocks (`:::branch title`)
- mermaid diagrams in fenced code blocks
- password-protected notes with session-only unlock
- light and dark mode toggle, persisted to localstorage

## visualisation

- per-note local graph showing direct neighbors and tags
- full garden graph modal with every note, tag, and edge
- force-directed layout, drag to arrange, click to navigate

## customisation

- profile sidebar block, edit `src/lib/profile.ts`
- design system in `src/index.css` and `tailwind.config.ts`
- all colors are hsl tokens, swap the palette in one place

## builder (`/landing`)

- gui flow for creating a garden in the browser
- profile editor for the bottom-corner identity card (name, handle, avatar, bio, links)
- notes list with frontmatter and markdown editing per note
- home page editor for the root index
- theme picker with 5 presets and an accent hue slider
- live preview that mirrors the published quire layout
- autosaves to localstorage
- publish dialog with two paths
  - hosted at quire.wiki/@handle, accounts arrive in phase 2
  - download zip for self-hosting, fully working today

