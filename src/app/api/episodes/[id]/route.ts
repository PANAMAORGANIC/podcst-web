import { NextResponse } from 'next/server';
import { coverUrl } from '@/catalog/cover';
import { getEntry } from '@/catalog/store';
import { cachedRssEpisodes } from '@/player/feed';
import { preferHttps } from '@/player/rss-episodes';
import type { EpisodesResponse, Playable } from '@/player/types';
import { loadYoutubeEpisodes } from '@/player/youtube-feed';

export const dynamic = 'force-dynamic';

const SUCCESS_CACHE_MS = 10 * 60 * 1000;
const EMPTY_CACHE_MS = 15 * 1000;

const cache = new Map<
  string,
  { at: number; ttl: number; payload: EpisodesResponse }
>();

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
  if (cached && Date.now() - cached.at < cached.ttl) {
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
    episodes = await cachedRssEpisodes(
      {
        id: entry.id,
        title: entry.title,
        artwork,
        rss: entry.externalUrls.rss,
      },
      { timeoutMs: 20_000, limit: 50 },
    );
    source = episodes.length ? 'rss' : 'none';
    if (!episodes.length) {
      message =
        'Could not load playable enclosures from the RSS feed. Open the show in its source.';
    }
  }

  if (!episodes.length && entry.externalUrls.youtube) {
    const youtube = await loadYoutubeEpisodes(
      {
        id: entry.id,
        title: entry.title,
        artwork,
        youtube: entry.externalUrls.youtube,
        youtubeChannelId: entry.externalUrls.youtubeChannelId,
      },
      { timeoutMs: 14_000, limit: 50 },
    );
    if (youtube.episodes.length) {
      episodes = youtube.episodes;
      source = 'youtube';
      message = undefined;
    } else {
      message = youtube.message ?? message;
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
  cache.set(id, {
    at: Date.now(),
    ttl: episodes.length ? SUCCESS_CACHE_MS : EMPTY_CACHE_MS,
    payload,
  });
  return NextResponse.json(payload);
}
