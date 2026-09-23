import { parseRssEpisodes, preferHttps } from './rss-episodes';
import type { Playable } from './types';

const UA =
  'WorldAudioRepository/1.0 (+https://github.com/PANAMAORGANIC/podcst-web)';
const CACHE_MS = 10 * 60 * 1000;
const MAX_XML = 4_000_000;

const cache = new Map<string, { at: number; episodes: Playable[] }>();

export async function fetchFeedXml(
  url: string,
  timeoutMs = 12_000,
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
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
    return text.length > MAX_XML ? text.slice(0, MAX_XML) : text;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function cachedRssEpisodes(
  show: {
    id: string;
    title: string;
    artwork?: string;
    rss?: string;
  },
  options: { timeoutMs?: number; limit?: number } = {},
): Promise<Playable[]> {
  if (!show.rss) return [];
  const hit = cache.get(show.id);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.episodes;
  const xml = await fetchFeedXml(show.rss, options.timeoutMs ?? 12_000);
  const episodes = xml
    ? parseRssEpisodes(
        xml,
        { id: show.id, title: show.title, artwork: show.artwork },
        options.limit ?? 40,
      )
    : [];
  cache.set(show.id, { at: Date.now(), episodes });
  return episodes;
}

export function resetFeedCache() {
  cache.clear();
}

export function primeFeedCache(showId: string, episodes: Playable[]) {
  cache.set(showId, { at: Date.now(), episodes });
}
