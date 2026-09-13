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

The live catalog is the editorial seed plus `data/catalog.json`. A first-pass
snapshot is checked in, so `npm run dev` already shows ingested titles.
Running the three scripts **upserts** more rows into that snapshot. Refresh
the running app (pages are dynamic) to see new titles in search, browse,
and rails.

```bash
npm run ingest:podcasts     # Podcasts (diversity-first)
npm run ingest:audiobooks   # LibriVox API + publisher cards
npm run ingest:youtube      # Curated channels; optional YOUTUBE_API_KEY
```

Re-runs are idempotent (same ids update, they do not duplicate). Receipts
land in `data/ingest/`. Nothing downloads audio or video files.

### Podcasts

Default path (no key): iTunes Search across curated
`data/sources/podcast-queries.json` countries and languages.

To use the official [Podcast Index](https://podcastindex.org/) dump instead:

```bash
# Place an extracted SQLite file, or download once (~1.8GB):
PODCASTINDEX_DUMP_PATH=.tmp/podcastindex_feeds.db npm run ingest:podcasts
# or
PODCASTINDEX_DOWNLOAD=1 npm run ingest:podcasts
```

Optional API batch (free keys from https://api.podcastindex.org/):

```bash
PODCASTINDEX_API_KEY=...
PODCASTINDEX_API_SECRET=...
```

`INGEST_LIMIT` defaults to 800 (sane first pass; raise as needed).

### Audiobooks

Paginates the public LibriVox JSON API, then merges
`data/sources/publisher-audiobooks.json` (in-copyright cards + store links).

### YouTube

Reads `data/sources/youtube-channels.json`. If `YOUTUBE_API_KEY` is set,
enriches title/description/thumbnail via the Data API. Without a key the
curated file still writes real catalog rows.

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
