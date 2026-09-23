import type { Playable } from './types';

const AUDIO_HINT = /audio|mpeg|mp3|m4a|aac|ogg|opus|wav|x-m4a|mp4|quicktime/i;

export function decodeXmlText(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Keep localStorage and the Now Playing sheet light. */
export const DESCRIPTION_MAX = 700;

export function clipDescription(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const text = decodeXmlText(value.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .trim();
  if (!text) return undefined;
  if (text.length <= DESCRIPTION_MAX) return text;
  return `${text.slice(0, DESCRIPTION_MAX - 1).trimEnd()}…`;
}

export function parseDurationSeconds(
  raw: string | undefined,
): number | undefined {
  if (!raw) return undefined;
  const value = raw.trim();
  if (/^\d+(\.\d+)?$/.test(value)) {
    const seconds = Number(value);
    return Number.isFinite(seconds) && seconds > 0
      ? Math.round(seconds)
      : undefined;
  }
  const parts = value.split(':').map((part) => Number(part));
  if (parts.some((part) => !Number.isFinite(part))) return undefined;
  if (parts.length === 3) {
    return Math.round(parts[0] * 3600 + parts[1] * 60 + parts[2]);
  }
  if (parts.length === 2) {
    return Math.round(parts[0] * 60 + parts[1]);
  }
  return undefined;
}

export function parseRfcDate(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function preferHttps(url: string): string {
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol === 'http:') parsed.protocol = 'https:';
    return parsed.toString();
  } catch {
    return url.trim();
  }
}

export function isHttpUrl(url: string | undefined): url is string {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
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

function extractItems(xml: string): string[] {
  const items: string[] = [];
  const pattern = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;
  let match = pattern.exec(xml);
  while (match?.[1]) {
    items.push(match[1]);
    match = pattern.exec(xml);
  }
  return items;
}

function enclosureUrl(item: string): string | undefined {
  const enclosure = tagAttr(item, 'enclosure', 'url');
  const enclosureType = tagAttr(item, 'enclosure', 'type') ?? '';
  if (
    isHttpUrl(enclosure) &&
    (!enclosureType || AUDIO_HINT.test(enclosureType))
  ) {
    return preferHttps(enclosure);
  }
  const media = tagAttr(item, 'media:content', 'url');
  const mediaType = tagAttr(item, 'media:content', 'type') ?? '';
  if (isHttpUrl(media) && (!mediaType || AUDIO_HINT.test(mediaType))) {
    return preferHttps(media);
  }
  return undefined;
}

function youtubeIdFromUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const match = url.match(
    /(?:youtube\.com\/watch\?[^#]*v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{6,})/i,
  );
  return match?.[1];
}

export function episodeId(
  showId: string,
  guid: string | undefined,
  enclosure: string | undefined,
  title: string,
): string {
  const raw = guid || enclosure || title;
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  }
  return `${showId}:${hash.toString(36)}`;
}

export function parseRssEpisodes(
  xml: string,
  show: {
    id: string;
    title: string;
    artwork?: string;
  },
  limit = 50,
): Playable[] {
  const channelImage =
    tagAttr(xml, 'itunes:image', 'href') || tagAttr(xml, 'itunes:image', 'url');
  const artwork = isHttpUrl(channelImage)
    ? preferHttps(channelImage)
    : show.artwork;

  const out: Playable[] = [];
  const seen = new Set<string>();

  for (const item of extractItems(xml)) {
    const title = tagText(item, ['title']) || 'Untitled episode';
    const link = tagText(item, ['link']);
    const guid = tagText(item, ['guid']);
    const enclosure = enclosureUrl(item);
    const youtubeId = youtubeIdFromUrl(link) || youtubeIdFromUrl(guid);
    if (!enclosure && !youtubeId) continue;

    const id = episodeId(show.id, guid, enclosure, title);
    if (seen.has(id)) continue;
    seen.add(id);

    const itemImage =
      tagAttr(item, 'itunes:image', 'href') ||
      tagAttr(item, 'itunes:image', 'url');

    out.push({
      id,
      showId: show.id,
      showTitle: show.title,
      title,
      kind: enclosure ? 'audio' : 'youtube',
      publishedAt: parseRfcDate(
        tagText(item, ['pubDate', 'dc:date', 'published']),
      ),
      durationSeconds: parseDurationSeconds(tagText(item, ['itunes:duration'])),
      enclosureUrl: enclosure,
      sourceUrl: isHttpUrl(link)
        ? preferHttps(link)
        : youtubeId
          ? `https://www.youtube.com/watch?v=${youtubeId}`
          : undefined,
      artwork: isHttpUrl(itemImage) ? preferHttps(itemImage) : artwork,
      youtubeId,
      description: clipDescription(
        tagText(item, ['itunes:summary', 'description', 'content:encoded']),
      ),
    });
    if (out.length >= limit) break;
  }

  return out;
}
