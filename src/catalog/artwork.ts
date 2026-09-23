import { parseRssChannelArtwork } from '@/player/rss-episodes';
import { isRemoteArtworkUrl } from './cover';
import { parseYoutubeUrl } from './signals';
import type { CatalogEntry } from './types';
import { knownYoutubeChannelId } from './youtube-channel-ids';

const itunesCache = new Map<string, string | null>();
const feedArtCache = new Map<string, string | null>();
const feedArtInflight = new Map<string, Promise<string | null>>();

const FEED_UA =
  'WorldAudioRepository/1.0 (+https://github.com/PANAMAORGANIC/podcst-web)';

export function appleIdFromCatalogId(id: string): string | null {
  const match = /^it-(\d{5,12})$/.exec(id);
  return match?.[1] ?? null;
}

export async function lookupItunesArtwork(
  appleId: string,
): Promise<string | null> {
  if (itunesCache.has(appleId)) return itunesCache.get(appleId) ?? null;
  try {
    const response = await fetch(
      `https://itunes.apple.com/lookup?id=${encodeURIComponent(appleId)}`,
      {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(4000),
      },
    );
    if (!response.ok) {
      itunesCache.set(appleId, null);
      return null;
    }
    const data = (await response.json()) as {
      results?: Array<{ artworkUrl600?: string; artworkUrl100?: string }>;
    };
    const hit = data.results?.[0];
    const url = hit?.artworkUrl600 || hit?.artworkUrl100;
    const art = isRemoteArtworkUrl(url) ? url : null;
    itunesCache.set(appleId, art);
    return art;
  } catch {
    itunesCache.set(appleId, null);
    return null;
  }
}

function youtubeChannelIdFor(entry: CatalogEntry): string | undefined {
  const stored = entry.externalUrls.youtubeChannelId;
  if (stored && /^UC[\w-]{20,}$/.test(stored)) return stored;
  const parsed = entry.externalUrls.youtube
    ? parseYoutubeUrl(entry.externalUrls.youtube)
    : undefined;
  if (parsed?.channelId) return parsed.channelId;
  return knownYoutubeChannelId(entry.id, parsed?.channelHandle);
}

function firstYoutubeThumb(xml: string): string | null {
  const match = xml.match(
    /<media:thumbnail\b[^>]*\surl\s*=\s*["']([^"']+)["']/i,
  );
  return isRemoteArtworkUrl(match?.[1]) ? match[1] : null;
}

async function fetchText(
  url: string,
  timeoutMs = 3500,
): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
        'User-Agent': FEED_UA,
      },
      signal: AbortSignal.timeout(timeoutMs),
      redirect: 'follow',
    });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

async function lookupFeedArtwork(entry: CatalogEntry): Promise<string | null> {
  const cached = feedArtCache.get(entry.id);
  if (cached !== undefined) return cached;
  const pending = feedArtInflight.get(entry.id);
  if (pending) return pending;

  const work = (async () => {
    if (entry.externalUrls.rss) {
      const xml = await fetchText(entry.externalUrls.rss);
      const art = xml ? parseRssChannelArtwork(xml) : undefined;
      if (isRemoteArtworkUrl(art)) return art;
    }
    const channelId = youtubeChannelIdFor(entry);
    if (channelId) {
      const xml = await fetchText(
        `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`,
      );
      const thumb = xml ? firstYoutubeThumb(xml) : null;
      if (thumb) return thumb;
    }
    return null;
  })().then((url) => {
    feedArtCache.set(entry.id, url);
    feedArtInflight.delete(entry.id);
    return url;
  });

  feedArtInflight.set(entry.id, work);
  return work;
}

/** Publisher/Apple/RSS/YouTube artwork only — never a local audio file. */
export async function resolveArtworkUrl(
  entry: CatalogEntry,
): Promise<string | null> {
  if (isRemoteArtworkUrl(entry.coverArt)) return entry.coverArt;

  const appleId = appleIdFromCatalogId(entry.id);
  if (appleId) {
    const itunes = await lookupItunesArtwork(appleId);
    if (itunes) return itunes;
  }

  return lookupFeedArtwork(entry);
}
