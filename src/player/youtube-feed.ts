import { parseYoutubeUrl } from '@/catalog/signals';
import { knownYoutubeChannelId } from '@/catalog/youtube-channel-ids';
import {
  clipDescription,
  decodeXmlText,
  isHttpUrl,
  parseRfcDate,
  preferHttps,
} from './rss-episodes';
import type { Playable } from './types';

const UA =
  'WorldAudioRepository/1.0 (+https://github.com/PANAMAORGANIC/podcst-web)';
const CHANNEL_ID = /^UC[\w-]{20,24}$/;
const SUCCESS_CACHE_MS = 10 * 60 * 1000;
const FAIL_CACHE_MS = 15 * 1000;
const RESOLVE_CACHE_MS = 24 * 60 * 60 * 1000;
const MAX_BODY = 6_000_000;

export type YoutubeEpisodeShow = {
  id: string;
  title: string;
  artwork?: string;
  youtube?: string;
  youtubeChannelId?: string;
};

export type YoutubeEpisodeResult = {
  episodes: Playable[];
  resolvedChannelId?: string;
  via: 'video' | 'atom' | 'data-api' | 'channel-page' | 'none';
  message?: string;
};

type CacheRow<T> = { at: number; ttl: number; value: T };

const episodeCache = new Map<string, CacheRow<YoutubeEpisodeResult>>();
const resolveCache = new Map<string, CacheRow<string | null>>();

export function isYoutubeChannelId(value: string | undefined): value is string {
  return Boolean(value && CHANNEL_ID.test(value));
}

export function hasYoutubeApiKey(): boolean {
  return Boolean(process.env.YOUTUBE_API_KEY?.trim());
}

export function youtubeVideosXmlUrl(channelId: string): string {
  return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
}

export function uploadsPlaylistId(channelId: string): string {
  return `UU${channelId.slice(2)}`;
}

export function resetYoutubeFeedCache() {
  episodeCache.clear();
  resolveCache.clear();
}

function cacheGet<T>(
  map: Map<string, CacheRow<T>>,
  key: string,
): T | undefined {
  const hit = map.get(key);
  if (!hit) return undefined;
  if (Date.now() - hit.at > hit.ttl) {
    map.delete(key);
    return undefined;
  }
  return hit.value;
}

function cacheSet<T>(
  map: Map<string, CacheRow<T>>,
  key: string,
  value: T,
  ttl: number,
) {
  map.set(key, { at: Date.now(), ttl, value });
}

function tagText(xml: string, names: string[]): string | undefined {
  for (const name of names) {
    const cdata = xml.match(
      new RegExp(
        `<${name}\\b[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${name}>`,
        'i',
      ),
    );
    if (cdata?.[1]) return decodeXmlText(cdata[1]);
    const tagged = xml.match(
      new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, 'i'),
    );
    if (tagged?.[1]) {
      const text = decodeXmlText(tagged[1].replace(/<[^>]+>/g, ' '));
      if (text) return text;
    }
  }
  return undefined;
}

function tagAttr(xml: string, tag: string, attr: string): string | undefined {
  const match = xml.match(
    new RegExp(
      `<${tag}\\b[^>]*\\s${attr}\\s*=\\s*["']([^"']+)["'][^>]*/?>`,
      'i',
    ),
  );
  return match?.[1] ? decodeXmlText(match[1]) : undefined;
}

function extractEntries(xml: string): string[] {
  const items: string[] = [];
  const pattern = /<entry\b[^>]*>([\s\S]*?)<\/entry>/gi;
  let match = pattern.exec(xml);
  while (match?.[1]) {
    items.push(match[1]);
    match = pattern.exec(xml);
  }
  return items;
}

function videoIdFromEntry(entry: string): string | undefined {
  const tagged = tagText(entry, ['yt:videoId']);
  if (tagged && /^[\w-]{6,}$/.test(tagged)) return tagged;
  const id = tagText(entry, ['id']);
  const fromId = id?.match(/yt:video:([\w-]{6,})/i);
  if (fromId?.[1]) return fromId[1];
  const href = tagAttr(entry, 'link', 'href') || tagText(entry, ['link']);
  const fromHref = href?.match(
    /(?:youtube\.com\/watch\?[^#]*v=|youtu\.be\/)([\w-]{6,})/i,
  );
  return fromHref?.[1];
}

export function parseYoutubeAtomFeed(
  xml: string,
  show: { id: string; title: string; artwork?: string },
  limit = 50,
): Playable[] {
  const out: Playable[] = [];
  const seen = new Set<string>();
  for (const entry of extractEntries(xml)) {
    const youtubeId = videoIdFromEntry(entry);
    if (!youtubeId) continue;
    const id = `${show.id}:${youtubeId}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const title = tagText(entry, ['title']) || 'Untitled video';
    const href = tagAttr(entry, 'link', 'href');
    const thumb = tagAttr(entry, 'media:thumbnail', 'url');
    out.push({
      id,
      showId: show.id,
      showTitle: show.title,
      title,
      kind: 'youtube',
      publishedAt: parseRfcDate(tagText(entry, ['published', 'updated'])),
      sourceUrl: isHttpUrl(href)
        ? preferHttps(href)
        : `https://www.youtube.com/watch?v=${youtubeId}`,
      artwork: isHttpUrl(thumb) ? preferHttps(thumb) : show.artwork,
      youtubeId,
      description: clipDescription(
        tagText(entry, ['media:description', 'summary', 'content']),
      ),
    });
    if (out.length >= limit) break;
  }
  return out;
}

function extractYtInitialData(html: string): unknown {
  const marker = html.search(/ytInitialData["']?\s*=\s*\{/);
  if (marker < 0) return undefined;
  const brace = html.indexOf('{', marker);
  if (brace < 0) return undefined;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = brace; i < html.length; i += 1) {
    const char = html[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === '{') depth += 1;
    else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(brace, i + 1));
        } catch {
          return undefined;
        }
      }
    }
  }
  return undefined;
}

function rendererTitle(record: Record<string, unknown>): string | undefined {
  const titleObj = record.title as
    | string
    | { simpleText?: string; content?: string; runs?: { text?: string }[] }
    | undefined;
  if (typeof titleObj === 'string' && titleObj.trim()) return titleObj.trim();
  if (!titleObj || typeof titleObj !== 'object') return undefined;
  const fromRuns = titleObj.runs?.map((run) => run.text).join('');
  return titleObj.simpleText || titleObj.content || fromRuns || undefined;
}

function collectVideoRenderers(
  node: unknown,
  out: { videoId: string; title?: string }[],
) {
  if (!node || typeof node !== 'object') return;
  const record = node as Record<string, unknown>;
  const directId =
    (typeof record.videoId === 'string' && record.videoId) ||
    (typeof record.contentId === 'string' && record.contentId) ||
    '';
  if (/^[\w-]{11}$/.test(directId)) {
    const metadata = record.metadata as Record<string, unknown> | undefined;
    const lockupMeta = metadata?.lockupMetadataViewModel as
      | Record<string, unknown>
      | undefined;
    const title =
      rendererTitle(record) ||
      (lockupMeta ? rendererTitle(lockupMeta) : undefined);
    out.push({ videoId: directId, title });
  }
  for (const value of Object.values(record)) {
    if (Array.isArray(value)) {
      for (const item of value) collectVideoRenderers(item, out);
    } else {
      collectVideoRenderers(value, out);
    }
  }
}

/** Uploads listed on a channel page. Not a watch-page or homepage scrape. */
export function parseYoutubeChannelPageUploads(
  html: string,
  show: { id: string; title: string; artwork?: string },
  limit = 50,
): Playable[] {
  const found: { videoId: string; title?: string }[] = [];
  const data = extractYtInitialData(html);
  if (data) collectVideoRenderers(data, found);
  if (!found.length) {
    const ids = [...html.matchAll(/"videoId":"([\w-]{11})"/g)].map(
      (match) => match[1],
    );
    for (const videoId of ids) found.push({ videoId });
  }
  const titled = found.filter((row) => row.title);
  const ranked = titled.length ? titled : found;
  const out: Playable[] = [];
  const seen = new Set<string>();
  for (const row of ranked) {
    if (seen.has(row.videoId)) continue;
    seen.add(row.videoId);
    out.push({
      id: `${show.id}:${row.videoId}`,
      showId: show.id,
      showTitle: show.title,
      title: row.title || show.title,
      kind: 'youtube',
      sourceUrl: `https://www.youtube.com/watch?v=${row.videoId}`,
      artwork: show.artwork,
      youtubeId: row.videoId,
    });
    if (out.length >= limit) break;
  }
  return out;
}

function singleVideoEpisode(
  show: YoutubeEpisodeShow,
  videoId: string,
): Playable {
  return {
    id: `${show.id}:${videoId}`,
    showId: show.id,
    showTitle: show.title,
    title: show.title,
    kind: 'youtube',
    sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
    artwork: show.artwork,
    youtubeId: videoId,
  };
}

async function fetchText(
  url: string,
  timeoutMs: number,
  accept: string,
): Promise<{ ok: boolean; status: number; text: string } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(preferHttps(url), {
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'User-Agent': UA,
        Accept: accept,
      },
    });
    const text = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      text: text.length > MAX_BODY ? text.slice(0, MAX_BODY) : text,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function apiKey(): string {
  return process.env.YOUTUBE_API_KEY?.trim() ?? '';
}

type ChannelsList = {
  error?: { errors?: { reason?: string }[]; message?: string };
  items?: {
    id?: string;
    contentDetails?: { relatedPlaylists?: { uploads?: string } };
  }[];
};

type PlaylistItemsList = {
  error?: { errors?: { reason?: string }[]; message?: string };
  items?: {
    contentDetails?: { videoId?: string };
    snippet?: {
      title?: string;
      description?: string;
      publishedAt?: string;
      thumbnails?: { high?: { url?: string }; medium?: { url?: string } };
    };
  }[];
};

function quotaMessage(payload: { error?: { errors?: { reason?: string }[] } }) {
  const reason = payload.error?.errors?.[0]?.reason;
  return reason === 'quotaExceeded' || reason === 'dailyLimitExceeded';
}

async function resolveChannelViaApi(
  handle: string,
  timeoutMs: number,
): Promise<{ channelId?: string; uploads?: string; quota?: boolean }> {
  const key = apiKey();
  if (!key) return {};
  const url = new URL('https://www.googleapis.com/youtube/v3/channels');
  url.searchParams.set('part', 'id,contentDetails');
  url.searchParams.set('forHandle', handle.replace(/^@/, ''));
  url.searchParams.set('key', key);
  const response = await fetchText(
    url.toString(),
    timeoutMs,
    'application/json',
  );
  if (!response) return {};
  let payload: ChannelsList;
  try {
    payload = JSON.parse(response.text) as ChannelsList;
  } catch {
    return {};
  }
  if (quotaMessage(payload)) return { quota: true };
  const item = payload.items?.[0];
  return {
    channelId: isYoutubeChannelId(item?.id) ? item.id : undefined,
    uploads: item?.contentDetails?.relatedPlaylists?.uploads,
  };
}

async function discoverChannelIdFromPage(
  youtubeUrl: string,
  timeoutMs: number,
): Promise<string | undefined> {
  const parsed = parseYoutubeUrl(youtubeUrl);
  if (parsed.kind !== 'channel') return undefined;
  const response = await fetchText(
    parsed.url,
    timeoutMs,
    'text/html,application/xhtml+xml',
  );
  if (!response?.text) return undefined;
  const feed = response.text.match(
    /feeds\/videos\.xml\?channel_id=(UC[\w-]{20,24})/i,
  );
  if (feed?.[1] && isYoutubeChannelId(feed[1])) return feed[1];
  return undefined;
}

export async function resolveYoutubeChannelId(
  show: YoutubeEpisodeShow,
  timeoutMs = 10_000,
): Promise<{ channelId?: string; uploads?: string; quota?: boolean }> {
  if (isYoutubeChannelId(show.youtubeChannelId)) {
    return { channelId: show.youtubeChannelId };
  }
  const parsed = show.youtube ? parseYoutubeUrl(show.youtube) : undefined;
  if (parsed?.channelId && isYoutubeChannelId(parsed.channelId)) {
    return { channelId: parsed.channelId };
  }
  const known = knownYoutubeChannelId(show.id, parsed?.channelHandle);
  if (known) return { channelId: known };

  const cacheKey = `resolve:${show.id}:${parsed?.channelHandle ?? parsed?.url ?? ''}`;
  const cached = cacheGet(resolveCache, cacheKey);
  if (cached !== undefined) {
    return { channelId: cached ?? undefined };
  }

  if (parsed?.channelHandle) {
    const api = await resolveChannelViaApi(parsed.channelHandle, timeoutMs);
    if (api.channelId) {
      cacheSet(resolveCache, cacheKey, api.channelId, RESOLVE_CACHE_MS);
      return api;
    }
    if (api.quota) return api;
  }

  if (show.youtube) {
    const discovered = await discoverChannelIdFromPage(show.youtube, timeoutMs);
    if (discovered) {
      cacheSet(resolveCache, cacheKey, discovered, RESOLVE_CACHE_MS);
      return { channelId: discovered };
    }
  }

  cacheSet(resolveCache, cacheKey, null, FAIL_CACHE_MS);
  return {};
}

async function fetchAtomEpisodes(
  show: YoutubeEpisodeShow,
  channelId: string,
  timeoutMs: number,
  limit: number,
): Promise<Playable[]> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, 700 * attempt));
    }
    const response = await fetchText(
      youtubeVideosXmlUrl(channelId),
      timeoutMs,
      'application/atom+xml, application/xml, text/xml, */*',
    );
    if (response?.ok && response.text.includes('<entry')) {
      return parseYoutubeAtomFeed(response.text, show, limit);
    }
  }
  return [];
}

function playablesFromPlaylist(
  show: YoutubeEpisodeShow,
  payload: PlaylistItemsList,
  limit: number,
): Playable[] {
  const out: Playable[] = [];
  const seen = new Set<string>();
  for (const item of payload.items ?? []) {
    const youtubeId = item.contentDetails?.videoId;
    if (!youtubeId || !/^[\w-]{6,}$/.test(youtubeId)) continue;
    const id = `${show.id}:${youtubeId}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const thumb =
      item.snippet?.thumbnails?.high?.url ||
      item.snippet?.thumbnails?.medium?.url;
    out.push({
      id,
      showId: show.id,
      showTitle: show.title,
      title: item.snippet?.title || 'Untitled video',
      kind: 'youtube',
      publishedAt: parseRfcDate(item.snippet?.publishedAt),
      sourceUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
      artwork: isHttpUrl(thumb) ? preferHttps(thumb) : show.artwork,
      youtubeId,
      description: clipDescription(item.snippet?.description),
    });
    if (out.length >= limit) break;
  }
  return out;
}

async function fetchPlaylistEpisodes(
  show: YoutubeEpisodeShow,
  playlistId: string,
  timeoutMs: number,
  limit: number,
): Promise<{ episodes: Playable[]; quota?: boolean }> {
  const key = apiKey();
  if (!key) return { episodes: [] };
  const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
  url.searchParams.set('part', 'snippet,contentDetails');
  url.searchParams.set('playlistId', playlistId);
  url.searchParams.set('maxResults', String(Math.min(50, Math.max(1, limit))));
  url.searchParams.set('key', key);
  const response = await fetchText(
    url.toString(),
    timeoutMs,
    'application/json',
  );
  if (!response) return { episodes: [] };
  let payload: PlaylistItemsList;
  try {
    payload = JSON.parse(response.text) as PlaylistItemsList;
  } catch {
    return { episodes: [] };
  }
  if (quotaMessage(payload)) return { episodes: [], quota: true };
  return { episodes: playablesFromPlaylist(show, payload, limit) };
}

function emptyResult(message: string): YoutubeEpisodeResult {
  return { episodes: [], via: 'none', message };
}

export async function loadYoutubeEpisodes(
  show: YoutubeEpisodeShow,
  options: { timeoutMs?: number; limit?: number } = {},
): Promise<YoutubeEpisodeResult> {
  const timeoutMs = options.timeoutMs ?? 12_000;
  const limit = options.limit ?? 50;
  const cached = cacheGet(episodeCache, show.id);
  if (cached) return cached;

  if (!show.youtube && !show.youtubeChannelId) {
    const result = emptyResult(
      'No YouTube channel or video URL is recorded for this title.',
    );
    cacheSet(episodeCache, show.id, result, FAIL_CACHE_MS);
    return result;
  }

  const parsed = show.youtube ? parseYoutubeUrl(show.youtube) : undefined;
  if (parsed?.kind === 'video' && parsed.videoId) {
    const result: YoutubeEpisodeResult = {
      episodes: [singleVideoEpisode(show, parsed.videoId)],
      via: 'video',
    };
    cacheSet(episodeCache, show.id, result, SUCCESS_CACHE_MS);
    return result;
  }

  if (parsed?.kind === 'unknown') {
    const result = emptyResult(
      'This YouTube link is not a channel or video. Open YouTube to browse — we do not scrape search pages or host files.',
    );
    cacheSet(episodeCache, show.id, result, SUCCESS_CACHE_MS);
    return result;
  }

  const resolved = await resolveYoutubeChannelId(show, timeoutMs);
  if (resolved.quota) {
    const result = emptyResult(
      'YouTube Data API quota is exhausted. Open the channel on YouTube — we never host the file.',
    );
    cacheSet(episodeCache, show.id, result, FAIL_CACHE_MS);
    return result;
  }

  if (!resolved.channelId) {
    const result = emptyResult(
      hasYoutubeApiKey()
        ? 'Could not resolve this YouTube handle to a channel id. Open the channel on YouTube — we do not scrape watch pages or host files.'
        : "Could not list this channel's uploads. Set YOUTUBE_API_KEY on the server so we can resolve the handle via the YouTube Data API, or open the channel on YouTube. We never host video files.",
    );
    cacheSet(episodeCache, show.id, result, FAIL_CACHE_MS);
    return result;
  }

  const atom = await fetchAtomEpisodes(
    show,
    resolved.channelId,
    timeoutMs,
    limit,
  );
  if (atom.length) {
    const result: YoutubeEpisodeResult = {
      episodes: atom,
      resolvedChannelId: resolved.channelId,
      via: 'atom',
    };
    cacheSet(episodeCache, show.id, result, SUCCESS_CACHE_MS);
    return result;
  }

  const playlist = resolved.uploads || uploadsPlaylistId(resolved.channelId);
  const api = await fetchPlaylistEpisodes(show, playlist, timeoutMs, limit);
  if (api.quota) {
    const result = emptyResult(
      'YouTube Data API quota is exhausted. Open the channel on YouTube — we never host the file.',
    );
    cacheSet(episodeCache, show.id, result, FAIL_CACHE_MS);
    return result;
  }
  if (api.episodes.length) {
    const result: YoutubeEpisodeResult = {
      episodes: api.episodes,
      resolvedChannelId: resolved.channelId,
      via: 'data-api',
    };
    cacheSet(episodeCache, show.id, result, SUCCESS_CACHE_MS);
    return result;
  }

  if (show.youtube && parseYoutubeUrl(show.youtube).kind === 'channel') {
    const page = await fetchText(
      show.youtube,
      timeoutMs,
      'text/html,application/xhtml+xml',
    );
    const fromPage = page?.text
      ? parseYoutubeChannelPageUploads(page.text, show, limit)
      : [];
    if (fromPage.length) {
      const result: YoutubeEpisodeResult = {
        episodes: fromPage,
        resolvedChannelId: resolved.channelId,
        via: 'channel-page',
      };
      cacheSet(episodeCache, show.id, result, SUCCESS_CACHE_MS);
      return result;
    }
  }

  const result = emptyResult(
    hasYoutubeApiKey()
      ? 'YouTube did not return uploads just now. Try again shortly, or open the channel on YouTube. We do not scrape watch pages or host files.'
      : "YouTube's public upload feed did not respond. Set YOUTUBE_API_KEY for the Data API fallback, or open the channel on YouTube. We never host video files.",
  );
  cacheSet(episodeCache, show.id, result, FAIL_CACHE_MS);
  return result;
}
