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
- Built-in translation with a clean `Translator` interface:
  local curated fallback, optional LibreTranslate.
- A seed catalogue that already spans dozens of languages and regions.
- Ingest scripts for Podcast Index, LibriVox-class audiobooks, and YouTube
  metadata — stubs that are honest about not hosting files.
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

## Roadmap

### Next (still catalogue)

- Persist ingest output (Postgres or a generated JSON snapshot).
- Podcast Index language/region mapping at scale, with editorial rails on
  top of the dump — not instead of it.
- LibriVox API pagination for public-domain breadth.
- YouTube Data API for curated channel IDs (needs `YOUTUBE_API_KEY`).
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
