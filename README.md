# brandbarbie

a digital garden for diy brand making. brandbarbie takes a folder of plain markdown files and grows it into a living, linked brand book: strategy, visual identity, applications, vocabulary, and the brand kit, all cross-referenced like a personal wiki instead of a static pdf.

it is built for people building a brand by hand: write a page when the thinking is ready, link it to the pages it depends on, fold the detail away until someone needs it. the brand book evolves the way the brand does.

imported from [kqrla/quire](https://github.com/kqrla/quire) and rebuilt as brandbarbie.

## structure

```
content/          ← the garden: every page is a markdown file
  strategy/       ← the why: audience, archetypes, personality
  visual-identity/ ← logo system, palettes, typography, illustration, layout
  applications/   ← the brand in the wild: website, social, print, email
  vocabulary/     ← voice, positioning, glossary, social bios
  brand-kit/      ← what to grab, tiered by honesty
  media/          ← images and video referenced by pages
docs/             ← engine documentation: features, porting, annotations, internals
src/              ← vite + react app that renders the garden
```

## writing

pages are markdown with frontmatter:

```markdown
---
title: my page
summary: one line shown in previews and search
tags: [strategy, start-here]
order: 1
date: 2026-10-18
---
```

- `[[wiki links]]` connect pages; backlinks, the graph, and hover previews are computed from them.
- `order` controls sidebar position. a folder is ordered by the smallest order among its pages, so putting `order: 1` on a folder's lead page positions the folder itself. unset order falls back to alphabetical.
- `{fold: visible | hidden}` makes inline foldable asides. see [docs/annotations.md](docs/annotations.md).
- `{hl:yellow|text}` and `{ul:wavy:pink|text}` are highlight and underline annotations. full reference in [docs/annotations.md](docs/annotations.md).
- tables, callouts (`:::note`, `:::tip`, `:::branch`), and mermaid diagrams render natively.

## media

drop images and video anywhere under `content/` (a `content/media/` folder is conventional) and embed them with standard markdown syntax:

```markdown
![alt text](media/photo.png)     ← image
![clip](media/demo.mp4)           ← video, inline player

https://youtu.be/xxxxxxxx        ← bare youtube/vimeo link on its own line becomes an embedded player
```

paths resolve against files in `content/`; external urls work as-is.

## run it

```sh
npm install
npm run dev       # http://localhost:8080
```

edit anything in `content/` and it appears immediately.
