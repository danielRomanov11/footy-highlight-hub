# Footy Highlight Hub

A public web app that aggregates **official football highlights** from trusted YouTube channels and websites (FIFA, UEFA, Fox Soccer, top leagues). Built for resume showcase with clean architecture, secure env handling, and automated ingestion.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind + shadcn/ui
- **Supabase** (Postgres) — video metadata cache with RLS
- **YouTube Data API v3** — channel uploads ingestion
- **Cheerio** — FIFA/UEFA website adapters
- **Vercel** — hosting (traffic-driven ingest, no platform cron)

## Architecture

```
Site traffic → middleware → POST /api/ingest/run-if-due (every ~2 hours)
  → YouTube adapter (uploads playlist, 1 quota unit/page)
  → Website adapters (FIFA, UEFA, generic)
  → Content classifier (highlight vs full_match)
  → Season resolver (competition → season → calendar_month)
  → Supabase upsert

Public UI → Supabase read (anon key + RLS)
  → Home (latest highlights)
  → Browse (competition → season → month)
  → Watch (embed or link-out)
```

## Setup

### 1. Clone and install

```bash
git clone https://github.com/danielRomanov11/footy-highlight-hub.git
cd footy-highlight-hub
npm install
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/20250614000000_initial_schema.sql` via the SQL editor (or Supabase CLI)
3. Copy project URL, anon key, and service role key

### 3. YouTube API

1. Create a Google Cloud project
2. Enable **YouTube Data API v3**
3. Create an API key (restrict to YouTube API only)

### 4. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
YOUTUBE_API_KEY=
CRON_SECRET=your-random-32-char-secret
INGEST_INTERVAL_HOURS=2
```

Optional:

```env
NEXT_PUBLIC_ENABLE_FULL_MATCHES=true
```

Set `INGEST_INTERVAL_HOURS` to change how often traffic can trigger ingest (default `2`).

Set `NEXT_PUBLIC_ENABLE_FULL_MATCHES=true` when ready to show full matches in the UI (Phase 4).

**Never commit `.env` or `.env.local`.** Only `.env.example` is tracked.

### 5. Run locally

```bash
npm run dev
```

### 6. Ingest videos manually

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/ingest
```

## Deploy (Vercel)

1. Push to GitHub and import the repo in Vercel
2. Add all env vars from `.env.example` in Vercel project settings
3. Deploy — no Vercel Cron needed (Hobby-friendly)
4. Ingest runs in the background when someone visits the site, at most once every `INGEST_INTERVAL_HOURS` (default 2)
5. Run the `20250614000005_ingest_state.sql` migration in Supabase if upgrading an existing deploy

## API

| Endpoint | Description |
|----------|-------------|
| `GET /api/videos` | Paginated videos (`?content_type=highlight&source=&competition=&season=&month=`) |
| `GET /api/videos/[id]` | Single video |
| `GET /api/competitions` | Competitions with seasons |
| `GET /api/competitions/[slug]/[season]` | Season archive + month summaries |
| `GET /api/competitions/[slug]/[season]/[month]` | Videos for a month |
| `POST /api/ingest/run-if-due` | Scheduled ingest if interval elapsed (requires `Authorization: Bearer CRON_SECRET`) |
| `GET /api/cron/ingest` | Manual ingest (requires `Authorization: Bearer CRON_SECRET`) |

## Security

- `.gitignore` blocks `.env*` except `.env.example`
- `SUPABASE_SERVICE_ROLE_KEY` and `YOUTUBE_API_KEY` are server-only
- Supabase RLS: public read-only on all tables; writes via service role in ingest routes
- GitHub Actions workflow checks that `.env` is never committed

## Roadmap

- **MVP (current):** Highlights from official YouTube + website scrapers
- **Phase 4:** Full matches tab, UEFA.tv sources, historical backfill, richer team/date parsing

## License

MIT — video content belongs to respective rights holders.
