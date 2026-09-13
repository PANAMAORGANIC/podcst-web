# World Audio Repository — product

World Audio Repository (WAR) is a **catalogue-first** web app for the spoken
and audio-adjacent record: podcasts, audiobooks, and long-form YouTube.

The interface language is English. Titles and descriptions can be translated
in place. Media stays with publishers, feeds, libraries, and platforms.

## Why this, not a player

The inherited codebase was [podcst-web](https://github.com/shantanuraj/podcst-web):
a polished PWA player with accounts, queues, Chromecast, and Postgres-backed
episode storage. That is a good player. It is a bad foundation for a *global
repository*.

A repository’s job is coverage. A player’s job is the next thirty minutes.
Those products fight: charts hide languages; playback sync wants a small
library; hosting audio is a copyright and ops trap.

v1 therefore keeps the useful bones (Next.js, TypeScript, Tailwind, search
patterns, Podcast Index / RSS as an *ingest idea*) and retires player-first
surfaces.

## What v1 is (this slice)

- Home search, type doors, and **diversity rails** (not popularity-only).
- Browse by type, language, region, genre; search across title, creator,
  tags, language, and type.
- Detail pages with original language, signals, and external deep links.
- **Feed agents** from a title: structured JSON packet + Markdown brief
  (copy / download; optional webhook). Agents ingest context without
  scraping the UI or hosting audio.
- Built-in translation with a clean `Translator` interface:
  local curated fallback, optional LibreTranslate.
- A seed catalogue that already spans dozens of languages and regions.
- Ingest pipelines that write `data/catalog.json.gz` (and compact JSON
  when it is under 40MB), merged with seed at read time. Podcast ingest
  runs a scaled Podcast Index dump (default 25k; `INGEST_FOCUS=en,es`
  at 100k boosts English/Spanish while keeping a diversity floor)
  **and** an optional Apple storefront harvest. Owner favorites ingest
  real show RSS (Anchor / SoundCloud / Transistor / Substack) plus
  search-and-pin — never Castbox. Recommend ingest pulls related
  titles from Podcast Index and Apple for liked seeds. LibriVox API;
  curated YouTube. Re-run `npm run ingest:*` to grow it.
- Runs with `npm install` and `npm run dev`. No API key, Postgres, or Redis.

## Catalogue fields

Every title has: type, title, original language, creators, description,
tags/genres, region, country, external URLs (RSS / YouTube / store /
LibriVox / site), generated cover art, and diversity / popularity signals.

## Ingest principles

1. Metadata and canonical URLs only.
2. Never scrape or store copyrighted audio or video files.
3. Public-domain works may deep-link to LibriVox / Gutenberg.
4. In-copyright audiobooks are cards + store/publisher links.
5. YouTube is a channel/series index, not a mirror.
6. Diversity weighting is editorial, not a raw download rank.
7. Agent packets are metadata, quotes, and links — never media files.

## Agent feed

When something in the catalogue is worth keeping, **Feed agents** on the
title page packages it in one or two clicks. Default intent is `distill`.
Copy and download work offline. `AGENT_FEED_WEBHOOK_URL` is optional and
documented in `.env.example`; no key is invented for the demo.

## Roadmap

### Next (still catalogue)

- Editorial rails on top of the Podcast Index dump + Apple harvest.
- Stable public read API (`/api/catalog` is the sketch).
- Cover art: optional remote artwork when a licence is clear; keep generated
  marks as the default so the grid never shows broken images.

### Later (still not a general player)

- User shelves / “saved cards” without playback sync.
- Editorial collections (e.g. “Sahel news desks”, “Andean languages”).
- Community corrections for language and region.
- If playback returns, it should be *optional* and always via the source
  (open the feed, the library, or the platform). Hosting remains out of
  scope.

## Success for this repository

The product is working when a listener in Lagos, Lima, or Lahore can find
something in their language *without* it being a translation of an American
chart, and when a researcher can trust that a copyrighted novel is a card
— not a file we should not have.
