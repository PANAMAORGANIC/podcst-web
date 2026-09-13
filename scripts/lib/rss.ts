/**
 * RSS channel metadata only. Never follows enclosure / media URLs.
 */

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fetchText } from './http';

export interface RssChannel {
  title?: string;
  description?: string;
  language?: string;
  link?: string;
  image?: string;
  author?: string;
  itemCount?: number;
}

const CACHE_DIR = path.join(process.cwd(), '.tmp', 'favorites-rss');

export function normalizeFeedUrl(raw: string | undefined): string {
  if (!raw) return '';
  try {
    const url = new URL(raw.trim());
    url.hash = '';
    url.hostname = url.hostname.toLowerCase();
    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1);
    }
    return url.toString();
  } catch {
    return raw.trim();
  }
}

export function feedCacheKey(feedUrl: string): string {
  return createHash('sha1')
    .update(normalizeFeedUrl(feedUrl))
    .digest('hex')
    .slice(0, 16);
}

export function rssId(feedUrl: string): string {
  return `rss-${feedCacheKey(feedUrl)}`;
}

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

function channelBody(xml: string): string {
  const match = xml.match(/<channel\b[^>]*>([\s\S]*?)<\/channel>/i);
  return match?.[1] ?? xml;
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
  return match?.[1]?.trim();
}

export function parseRssChannel(xml: string): RssChannel {
  const channel = channelBody(xml);
  const image =
    tagAttr(channel, 'itunes:image', 'href') ||
    tagAttr(channel, 'itunes:image', 'url') ||
    tagText(channel, ['itunes:image']) ||
    tagText(channel, ['url']);
  const items = channel.match(/<item\b/gi);
  return {
    title: tagText(channel, ['title']),
    description: tagText(channel, [
      'description',
      'itunes:summary',
      'itunes:subtitle',
    ]),
    language: tagText(channel, ['language']),
    link: tagText(channel, ['link']),
    image,
    author: tagText(channel, ['itunes:author', 'author', 'managingEditor']),
    itemCount: items?.length,
  };
}

export function readRssCache(feedUrl: string): string | null {
  const file = path.join(CACHE_DIR, `${feedCacheKey(feedUrl)}.xml`);
  if (!existsSync(file)) return null;
  return readFileSync(file, 'utf8');
}

export function writeRssCache(feedUrl: string, xml: string) {
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(path.join(CACHE_DIR, `${feedCacheKey(feedUrl)}.xml`), xml);
}

export async function loadRssChannel(feedUrl: string): Promise<{
  channel: RssChannel | null;
  source: 'network' | 'cache' | 'none';
}> {
  const remote = await fetchText(feedUrl);
  if (remote.ok) {
    writeRssCache(feedUrl, remote.data);
    return { channel: parseRssChannel(remote.data), source: 'network' };
  }
  const cached = readRssCache(feedUrl);
  if (cached) {
    return { channel: parseRssChannel(cached), source: 'cache' };
  }
  return { channel: null, source: 'none' };
}
