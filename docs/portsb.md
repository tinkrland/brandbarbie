# portsb.md

how to migrate quire.wiki from flat markdown files to a supabase backend, so notes can be stored in a database, edited at runtime, and updated without redeploys.

this is an architectural migration. read the whole document before starting.

## what changes

| layer | current | after migration |
|---|---|---|
| storage | files in `/content` | postgres `notes` table |
| loading | `import.meta.glob` at build time | `supabase.from('notes').select()` at runtime |
| updates | edit file, redeploy | edit row, instant |
| auth | none | optional, supabase auth |
| offline | works fully | requires network |
| version history | git | postgres or custom log table |

## step 1, create a supabase project

1. sign up at supabase.com
2. create a project
3. pick a region near your users
4. save the project url and the anon public key from settings, api

## step 2, create the schema

run the following sql in the supabase sql editor.

```sql
create table notes (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  content     text not null default '',
  tags        text[] default '{}',
  date        text,
  summary     text,
  cover       text,
  password    text,
  draft       boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index notes_slug_idx on notes (slug);

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger notes_updated_at
  before update on notes
  for each row execute function update_updated_at();
```

## step 3, enable row level security

```sql
alter table notes enable row level security;

create policy "public can read published notes"
  on notes for select
  using (draft = false);
```

draft notes will be hidden from anonymous viewers. add an authenticated policy if you want logged-in users to see drafts.

## step 4, install the supabase client

```bash
npm install @supabase/supabase-js
```

create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

add to `.env.local`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

never put the service role key in frontend code. only the anon key. row level security handles access control.

## step 5, migrate existing notes

create `scripts/migrate.mjs`:

```javascript
import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function walk(dir, base = dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walk(full, base))
    else if (entry.endsWith('.md')) out.push(full)
  }
  return out
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { fm: {}, content: raw }
  const fm = {}
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.+)$/)
    if (!kv) continue
    const [, key, value] = kv
    if (key === 'tags') fm.tags = value.replace(/[\[\]]/g, '').split(',').map(t => t.trim()).filter(Boolean)
    else if (key === 'draft') fm.draft = value.trim() === 'true'
    else fm[key] = value.trim().replace(/^["']|["']$/g, '')
  }
  return { fm, content: match[2] }
}

const files = walk('./content')

for (const file of files) {
  const raw = readFileSync(file, 'utf-8')
  const { fm, content } = parseFrontmatter(raw)
  const slug = relative('./content', file).replace(/\.md$/, '').replace(/\/index$/, '') || 'index'
  const { error } = await supabase.from('notes').upsert({
    slug,
    title: fm.title || slug.split('/').pop().replace(/-/g, ' '),
    content,
    tags: fm.tags || [],
    date: fm.date || null,
    summary: fm.summary || null,
    cover: fm.cover || null,
    password: fm.password || null,
    draft: fm.draft || false,
  })
  if (error) console.error('failed', slug, error.message)
  else console.log('migrated', slug)
}
```

run with the service role key (server-side only):

```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/migrate.mjs
```

## step 6, rewrite content.ts

replace `src/lib/content.ts` with an async version that fetches from supabase. example outline:

```typescript
import { supabase } from './supabase'

export async function getPages() {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('draft', false)
  if (error) throw error
  return data.map(row => ({
    slug: row.slug,
    title: row.title,
    content: row.content,
    frontmatter: {
      title: row.title,
      tags: row.tags,
      date: row.date,
      summary: row.summary,
      cover: row.cover,
      password: row.password,
      draft: row.draft,
    },
    wikiLinks: extractWikiLinks(row.content),
  }))
}
```

every component that calls `getPages()` or `getPage()` becomes async. wrap usages in `react-query` or `useEffect` plus loading states. the change is mechanical but touches almost every page.

## decision guide

| you want | use |
|---|---|
| edit notes without redeploying | supabase |
| zero latency on first load | flat files |
| offline capability | flat files |
| collaborative editing | supabase |
| git history per note | flat files |
| private notes per user | supabase |
| simplest possible hosting | flat files |
| programmatic note creation | supabase |

most single-author gardens are better off with flat files. supabase makes sense when you have multiple contributors, want a live editor ui, or need per-user access control.
