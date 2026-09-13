# World Audio Repository

A production-quality catalogue of **podcasts**, **audiobooks**, and
**long-form YouTube** — built for linguistic and regional range, not a
single popularity chart.

The interface is English. Titles and descriptions can be translated in
place. We store metadata and deep links. We do not host audio files.

This repository was forked from
[shantanuraj/podcst-web](https://github.com/shantanuraj/podcst-web) and
reshaped from a player into a repository. See [PRODUCT.md](PRODUCT.md)
for the longer plan.

## Requirements

- Node.js 20+
- npm

No PostgreSQL, Redis, or API key is required to run the demo.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## What you can do

- Search titles, creators, tags, languages, and types
- Browse **Podcasts**, **Audiobooks**, and **YouTube**
- Filter by language, region, and genre
- Sort by diversity (default) or popularity
- Open a title page and follow RSS / YouTube / LibriVox / store links
- Translate non-English titles and descriptions (local seed, or a live
  translator if you configure one)
- **Feed agents** from a title page: copy or download a structured packet
  (JSON + Markdown brief), or POST it to a webhook if configured

## Translation

The default translator reads curated English fields on the seed catalogue
and needs no key.

To use a [LibreTranslate](https://libretranslate.com/)-compatible service,
copy `.env.example` to `.env.local` and set:

```bash
LIBRETRANSLATE_URL=https://your-instance.example
LIBRETRANSLATE_API_KEY=   # optional; only if the instance requires one
```

Do not commit real keys. The app never invents credentials.

## Feed agents

On any title page, **Feed agents** builds a stable packet agents can ingest
without scraping the UI: source, type, title, creators, language, region,
tags, URLs, selected text / quote, note, optional timestamp, intent
(`distill` | `research` | `remember`).

Copy JSON or a Markdown “distill a source” brief, or download either file.
That path needs no key.

To POST the bundle `{ packet, markdown }` to your own agent inbox:

```bash
AGENT_FEED_WEBHOOK_URL=https://your-agent.example/ingest
AGENT_FEED_WEBHOOK_SECRET=   # optional
AGENT_FEED_WEBHOOK_HEADER=X-Agent-Feed-Secret
```

The webhook URL and secret stay on the server. If the URL is unset, Send
is hidden and copy/download still work.

## Ingest (metadata only)

```bash
npm run ingest:podcasts     # Podcast Index path (stub / dry-run without DB)
npm run ingest:audiobooks   # LibriVox-class + publisher cards
npm run ingest:youtube      # YouTube metadata; optional YOUTUBE_API_KEY later
```

These scripts write receipts under `data/ingest/` and refuse to download
media. Podcast Index sync can grow into a real upsert when `DATABASE_URL`
and a dump are available — see `scripts/ingest-podcast-index.ts`.

## Stack

- Next.js (App Router) · React 19 · TypeScript
- Tailwind CSS 4
- File-based seed catalogue + `match-sorter` search
- Biome for lint/format

Player, accounts, Chromecast, Redis, and the old episode store were
removed from the running app so the product can be catalog-first.

## License

MIT — see [LICENSE.md](LICENSE.md). Catalogue descriptions are editorial
metadata; linked works remain with their rights holders.
