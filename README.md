# brandbarbie

a markdown brand book — the full brandbarbie brand system (strategy, visual identity, applications, vocabulary, brand kit) as plain `.md` files, rendered as a linked site with search, tags, and a page tree.

imported from [kqrla/quire](https://github.com/kqrla/quire) and rebuilt as brandbarbie.

## structure

```
content/          ← the brand book: every page is a markdown file
  strategy/       ← the why
  visual-identity/ ← logos, palettes, typography, illustration, layout
  applications/   ← the brand in the wild
  vocabulary/     ← voice, positioning, glossary
  brand-kit/      ← what to grab, tiered
src/              ← vite + react app that renders the content
```

## run it

```sh
npm install
npm run dev       # http://localhost:8080
```

pages are plain markdown with frontmatter (`title`, `summary`, `tags`, `date`) and `[[wiki links]]` — edit anything in `content/` and it appears immediately.
