# port.md

how to run quire.wiki locally and deploy it anywhere static hosting is supported. this guide assumes you have a copy of the source tree (this repository).

## what this project is

quire.wiki is a digital garden engine in the style of obsidian publish or quartz. it reads markdown files from the `/content` folder at build time, parses them into pages with wiki-links, tags, backlinks, and a force-directed graph, and renders them as a fast static site.

there is no backend by default. notes live as plain markdown files. updating a note means editing the file and rebuilding.

## requirements

- node 20 or later
- npm, pnpm, bun, or yarn

## install

```bash
npm install
```

all dependencies are standard npm packages. nothing platform-specific.

## run locally

```bash
npm run dev
```

the dev server starts on port 8080. open `http://localhost:8080` in your browser. the `/content` folder hot-reloads via vite's `import.meta.glob`.

## edit your content

all notes live in `/content`. structure it however you want. folders become sections in the sidebar tree. file names become slugs.

frontmatter is optional but recommended:

```markdown
---
title: a beautiful note
tags: [meta, ideas]
date: 2026-04-28
summary: a short description shown in previews
cover: https://example.com/image.jpg
password: optional-password
draft: false
---

your markdown here. wiki-links work like this: [[other-note]].
```

## edit your profile

edit `src/lib/profile.ts` to update the sidebar identity. set name, handle, bio, avatar url, and social links.

## build for production

```bash
npm run build
```

output goes to `/dist`. this is a static folder you can deploy anywhere.

## deploy

### vercel

1. push the repo to github
2. import it on vercel.com
3. vite is auto-detected. no configuration needed
4. deploy

### cloudflare pages

1. connect your repo at pages.cloudflare.com
2. build command: `npm run build`
3. output directory: `dist`

### netlify

1. connect your repo
2. build command: `npm run build`
3. publish directory: `dist`

### github pages

1. add `base: '/your-repo-name/'` to `vite.config.ts`
2. run `npm run build`
3. push the contents of `/dist` to a `gh-pages` branch
4. enable github pages in your repository settings

### docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
docker build -t quire-wiki .
docker run -p 8080:80 quire-wiki
```

## environment variables

none required for the default flat-file setup. if you migrate to a database backend, see `portsb.md` for the variables that backend introduces.

## what is portable

| item | portable | notes |
|---|---|---|
| `/content/**/*.md` | yes | plain markdown, no platform dependency |
| `src/lib/content.ts` | yes | uses `import.meta.glob`, standard vite |
| `src/lib/markdown.tsx` | yes | pure react |
| `src/components/**` | yes | shadcn/ui plus react |
| `src/pages/**` | yes | react-router-dom |
| `src/index.css` | yes | standard css |

there is no platform lock-in. the entire project can be lifted out of lovable and run on any node host.

## the in-browser builder

quire ships a `/landing` route that lets a visitor compose a garden in the browser without writing files by hand. it edits a json model in localstorage and exports a zip containing markdown notes plus a generated `src/lib/profile.ts` and `src/theme.css`.

to use the export:

1. unzip
2. drop `content/`, `src/lib/profile.ts`, and `src/theme.css` into a fresh checkout of this repo
3. open `src/main.tsx` and add `import './theme.css'` after the existing `import './index.css'`
4. run `npm install && npm run dev`

a future release will ship the engine inside the zip itself so step 2 collapses to "unzip and run".
