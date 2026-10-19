# underthehood.md

## architecture at a glance

```
content/                 markdown source of truth
src/
  lib/
    content.ts           reads markdown, builds the page graph
    markdown.tsx         parses and renders markdown to react
    mode.tsx             light or dark mode context
    profile.ts           user-editable identity block
  components/
    Layout.tsx           three-column shell
    LeftSidebar.tsx      logo, search, page tree, profile
    RightSidebar.tsx     graph, toc, tags, backlinks, metadata
    PageTree.tsx         recursive folder and file list
    LocalGraph.tsx       force-directed graph (local and full garden)
    PagePreviewCard.tsx  hovercard body
    LockScreen.tsx       password gate for protected notes
    MermaidBlock.tsx     lazy mermaid renderer
    ModeToggle.tsx       sun and moon button
    ui/                  shadcn primitives
  pages/
    HomePage.tsx         renders content/index.md or a tag overview
    NotePage.tsx         renders any note by slug
    TagPage.tsx          notes filtered by tag
    NotFound.tsx         404 fallback
  App.tsx                providers, router, routes
  main.tsx               react root
  index.css              design system tokens, base styles, markdown styles
```

## data flow

1. at build time, vite inlines every file under `/content/**/*.md` as raw strings via `import.meta.glob`
2. `getPages()` parses frontmatter, extracts wiki-links, computes a slug from the file path
3. results are memoised in module scope, so further calls are free
4. components call `getPages()`, `getPage(slug)`, `getBacklinks(slug)`, `getLinkedPages(slug)`, `getAdjacentPages(slug)`, `getAllTags()`, `getPagesByTag(tag)`, `searchPages(query)`, `buildTree()`, `extractTOC(content)`
5. rendering is purely synchronous, react renders immediately, no loading states needed

## the markdown pipeline

`markdown.tsx` is two layers:

- `tokenizeInline(text)` walks a string once and produces tokens for bold, italic, code, links, media, wiki-links, folds, and annotations
- `parseBlocks(content)` walks the document line by line and produces blocks for headings, paragraphs, lists, code, blockquotes, hr, callouts, and branches
- `MarkdownContent` maps blocks to react elements, recursing into the inline pipeline for any text content

this avoids the complexity of a full ast and the dependencies that come with it. the parser only supports what the garden actually uses.

## the graph

`LocalGraph.tsx` runs a small force simulation in javascript, no external library. nodes repel each other, edges act like springs to a target distance, a weak gravity pulls everything toward the center. the simulation cools (alpha decays) and stops when motion is small. drag pins a node, releasing unpins it. the same component renders both the small sidebar graph and the full screen modal.

## modes

`mode.tsx` exposes a context with `mode` and `setMode`. it writes a class on `<html>` and persists choice to localstorage. all theme-specific colors are hsl variables in `index.css` and switch automatically.

## why no backend

the entire app is a static bundle. no server, no database, no api routes. the build outputs html, js, css, and the inlined markdown content. you can host the `dist/` folder anywhere. when you want a database, follow `portsb.md`.

## extension points

- new block types: extend `parseBlocks` and add a renderer in `MarkdownContent`
- new inline syntax: extend `tokenizeInline` and add a component in `renderTokens`
- new sidebar widgets: add to `RightSidebar.tsx`
- new themes: add a class on `<html>` and override the hsl variables under that selector in `index.css`
