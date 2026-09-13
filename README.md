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
- **For you** — a learned mix from likes and optional YouTube Data API
  signals (not a youtube.com homepage scrape)

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

The live catalog is the editorial seed plus the ingest snapshot
(`data/catalog.json.gz`, with a compact `data/catalog.json` when it fits
under 40MB). A snapshot is checked in, so `npm run dev` already shows
ingested titles. Running the three scripts **upserts** more rows. Refresh
the running app (pages are dynamic) to see new titles in search, browse,
and rails.

```bash
npm run ingest:podcasts     # Podcasts (diversity-first)
npm run ingest:audiobooks   # LibriVox API + publisher cards
npm run ingest:youtube      # Curated channels; optional YOUTUBE_API_KEY
npm run ingest:favorites    # Owner RSS hubs + search-and-pin
npm run ingest:recommend    # Related shows for liked / favorite seeds
npm run ingest:for-you      # Learn topic weights + daily For You snapshot
```

Re-runs are idempotent (same ids update, they do not duplicate). Receipts
land in `data/ingest/`. Nothing downloads audio or video files.

### Podcasts

`npm run ingest:podcasts` runs **two strategies** and upserts both into
the live snapshot (idempotent `pi-*` / `it-*` ids):

1. **Podcast Index dump** when a SQLite file is present or you opt in to
   download. Diversity-first sample (not English-only charts).
2. **Apple / iTunes storefront harvest** (default on). Public Search API,
   no key. Language-first queries in `data/sources/podcast-queries.json`
   plus storefront × term/genre packs in
   `data/sources/itunes-storefronts.json` (us, mx, br, ng, in, jp, de,
   fr, es, ar, eg, za, kr, cn, pl, tr, id, ph, and more).

```bash
# Apple harvest only (default if no dump is configured)
npm run ingest:podcasts

# Big English + Spanish pass (dump + Apple favorites)
PODCASTINDEX_DOWNLOAD=1 INGEST_LIMIT=100000 INGEST_FOCUS=en,es npm run ingest:podcasts

# Scaled dump-only pass (download ~1.8GB if missing, then cached in .tmp/)
PODCASTINDEX_DOWNLOAD=1 INGEST_LIMIT=50000 ITUNES_HARVEST=0 npm run ingest:podcasts

# Default dump limit is 25000; 50k–150k is supported without OOM
ITUNES_HARVEST=0 npm run ingest:podcasts

# Already-extracted dump
PODCASTINDEX_DUMP_PATH=.tmp/podcastindex_feeds.db ITUNES_HARVEST=0 npm run ingest:podcasts
```

`INGEST_FOCUS=en,es` reserves about a quarter of the batch for other
languages (diversity floor), then fills the rest from English and
Spanish ranked by popularity so mainstream and mid-tail shows appear.
Apple harvest then adds extra us/gb/au/ca and mx/es/ar/co/cl/pe/uy
storefront packs from `data/sources/itunes-focus-en-es.json`.

iTunes Search is unauthenticated. The script spaces requests (~180ms),
retries HTTP 429 with backoff, and requests 50 results per query (API
max 200). Some storefronts return 400 (no store); those queries are
skipped.

Optional Podcast Index API batch (free keys from
https://api.podcastindex.org/ — do not invent or commit them):

```bash
PODCASTINDEX_API_KEY=...
PODCASTINDEX_API_SECRET=...
```

`INGEST_LIMIT` defaults to **25000 per strategy** (overridable). A 100k
en/es pass is the documented big command above. The dump sampler uses a
single SQL pass plus optional focus extras, truncated descriptions, and
a gzip snapshot.

### Favorites (RSS hubs + search-and-pin)

Owner shows that dump sampling missed go in `data/sources/favorites.json`
with the **real show RSS** (Anchor, SoundCloud, Transistor, Substack,
Podbean, Libsyn, Pacifica — not Castbox HTML). `npm run ingest:favorites`
fetches each channel for title, description, language, link, and artwork.
It does
**not** download enclosures. Apple ids become stable `it-{appleId}`
rows; otherwise Podcast Index (API or local dump, by feed URL) yields
`pi-*`, else `rss-*`.

```bash
# Curated feeds + Pacifica / public-radio Apple cards
npm run ingest:favorites

# Skip hub expansion (just the JSON feeds + pins)
FAVORITES_EXPAND=0 npm run ingest:favorites

# Paste more titles (resolved via iTunes Search, then Podcast Index)
FAVORITE_PINS='Another Show|One More Show' npm run ingest:favorites
npm run ingest:favorites -- --pin "Radio Semilla"
```

Add a lasting card by appending to `shows` in
`data/sources/favorites.json` (title, feedUrl, appleId, language, tags,
hub). One-off pins can also go in `data/sources/favorite-pins.json`.
Re-runs are idempotent. After the first fetch, RSS XML is cached in
`.tmp/favorites-rss/` so a later pass can run offline-ish.

### Likes and recommendations

Owner favorites are the default liked seeds. On a title page, **Like this
show** stores the id in `localStorage` (`war-liked-ids`) and POSTs to
`/api/likes`, which writes `data/sources/liked.json` (gitignored) so
ingest can read extra likes on this machine.

`/for-you` is the learned daily mix. Home and `/recommendations` still
show **Because you like {show}** rails.
`GET /api/recommend?seed=id` (or `?seeds=id,id`) ranks the live catalog:
same language and shared tags/genres first, then hub/network peers
(Pacifica near EcoJustice), then popularity, with a diversity tilt so a
Spanish seed does not collapse to a US-only chart.

```bash
# Pull related shows from Podcast Index + Apple for every favorite seed
npm run ingest:recommend

# Optional: related/similar by feed URL or iTunes id
PODCASTINDEX_API_KEY=...
PODCASTINDEX_API_SECRET=...
npm run ingest:recommend
```

Without API keys the script still uses the local Podcast Index dump
(language + category neighbors) and Apple Search (`relatedTerms` /
`relatedGenreIds` on each favorite). Metadata and feed links only.

### For you (continuous learning)

`/for-you` ranks podcasts and long-form YouTube from **topic weights that
update over time**. Each `npm run ingest:for-you` (or a daily cron):

1. Re-reads owner favorites and runtime likes (`liked.json`).
2. If `YOUTUBE_API_KEY` is set, searches public channels for the top
   weighted topics (English and Spanish heavy, still open).
3. If OAuth refresh-token env vars are set later, pulls
   `subscriptions.list` and liked videos (`videos.list?myRating=like`)
   and maps channel topics into those weights.
4. Expands the YouTube + podcast catalog with related/search hits.
5. Writes `data/for-you/latest.json` (and a dated copy) that the page
   reads.

The UI explains this is **learned from your likes & YouTube signals
(not homepage scrape)** and shows last learned-at. You can paste a
YouTube channel or video URL as a strong positive signal.

`GET /api/for-you` and `GET /api/health` dump `LEARNED_TOPICS` for
debugging. Signal state lives in `data/sources/user-signals.json`.

**Out of scope:** scraping `youtube.com` homepage or recommendation
HTML. That feed has no supported API. The path is Google Cloud → YouTube
Data API (key now; OAuth later). Setup notes: [docs/youtube-signals.md](docs/youtube-signals.md).

```bash
# Daily refresh from databases + learned weights
npm run ingest:for-you
```

### Audiobooks

Paginates the public LibriVox JSON API, then merges
`data/sources/publisher-audiobooks.json` (in-copyright cards + store links).

### YouTube

Reads `data/sources/youtube-channels.json` — a curated pack of **400+**
podcast, lecture, and interview channels (English and Spanish heavy,
plus other languages). If `YOUTUBE_API_KEY` is set, enriches
title/description/thumbnail and topic tags via the Data API. Without a
key the curated file still writes real catalog rows. This is an index
of channel URLs, not a media host, and not a scrape of YouTube’s
logged-in homepage.

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
