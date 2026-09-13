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
