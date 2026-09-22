import { NextResponse } from 'next/server';
import { coverUrl } from '@/catalog/cover';
import { parseYoutubeUrl } from '@/catalog/signals';
import { getEntry } from '@/catalog/store';
import { parseRssEpisodes, preferHttps } from '@/player/rss-episodes';
import type { EpisodesResponse, Playable } from '@/player/types';

export const dynamic = 'force-dynamic';

const UA =
  'WorldAudioRepository/1.0 (+https://github.com/PANAMAORGANIC/podcst-web)';
const CACHE_MS = 10 * 60 * 1000;
const MAX_XML = 4_000_000;

const cache = new Map<string, { at: number; payload: EpisodesResponse }>();

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const entry = getEntry(id);
  if (!entry) {
    return NextResponse.json({ error: 'not found', id }, { status: 404 });
  }

  const cached = cache.get(id);
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return NextResponse.json(cached.payload);
  }

  const links = {
    rss: entry.externalUrls.rss,
    youtube: entry.externalUrls.youtube,
    store: entry.externalUrls.store,
    website: entry.externalUrls.website,
    librivox: entry.externalUrls.librivox,
  };
  const artwork = coverUrl(entry);
  const base = {
    showId: entry.id,
    showTitle: entry.title,
    type: entry.type,
    links,
  };

  let episodes: Playable[] = [];
  let source: EpisodesResponse['source'] = 'none';
  let message: string | undefined;

  if (entry.externalUrls.rss) {
    const xml = await fetchFeed(entry.externalUrls.rss);
    if (xml) {
      episodes = parseRssEpisodes(
        xml,
        { id: entry.id, title: entry.title, artwork },
        50,
      );
      source = episodes.length ? 'rss' : 'none';
      if (!episodes.length) {
        message =
          'The feed had no playable enclosures. Open the show in its source.';
      }
    } else {
      message = 'Could not load the RSS feed. Open the show in its source.';
    }
  }

  if (!episodes.length && entry.externalUrls.youtube) {
    const parsed = parseYoutubeUrl(entry.externalUrls.youtube);
    if (parsed.videoId) {
      episodes = [
        {
          id: `${entry.id}:${parsed.videoId}`,
          showId: entry.id,
          showTitle: entry.title,
          title: entry.title,
          kind: 'youtube',
          sourceUrl: `https://www.youtube.com/watch?v=${parsed.videoId}`,
          artwork,
          youtubeId: parsed.videoId,
        },
      ];
      source = 'youtube';
      message = undefined;
    } else if (!message) {
      message =
        'This YouTube title is a channel. Open it on YouTube — we do not scrape watch pages.';
    }
  }

  if (!episodes.length && !message) {
    message =
      entry.type === 'audiobook'
        ? 'No streamable feed is recorded. Open the library or store link.'
        : 'No playable episodes are recorded for this title.';
  }

  const payload: EpisodesResponse = {
    ...base,
    source,
    episodes: episodes.map((item) => ({
      ...item,
      enclosureUrl: item.enclosureUrl
        ? preferHttps(item.enclosureUrl)
        : undefined,
    })),
    message,
  };
  cache.set(id, { at: Date.now(), payload });
  return NextResponse.json(payload);
}

async function fetchFeed(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(preferHttps(url), {
      signal: controller.signal,
      headers: {
        'User-Agent': UA,
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
      next: { revalidate: 600 },
    });
    if (!response.ok) return null;
    const text = await response.text();
    if (text.length > MAX_XML) return text.slice(0, MAX_XML);
    return text;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
