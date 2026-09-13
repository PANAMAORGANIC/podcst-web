import { getLanguage } from '@/catalog/languages';
import { getRegion } from '@/catalog/regions';
import type { CatalogEntry } from '@/catalog/types';
import {
  AGENT_FEED_SOURCE,
  type AgentFeedBundle,
  type AgentFeedPacket,
  type AgentFeedSelection,
  type AgentIntent,
} from './types';

const INTENT_PROMPTS: Record<AgentIntent, string> = {
  distill:
    'Distill this source. Return the essence, the argument, and what is distinctive — not a paraphrase dump.',
  research:
    'Research this source. Note claims to verify, related titles, and open questions.',
  remember:
    'File this for later. Keep the citation, the selected passage, and why it was kept.',
};

export function buildAgentFeed(
  entry: CatalogEntry,
  selection: AgentFeedSelection = { includeTitle: true },
): AgentFeedBundle {
  const intent = selection.intent ?? 'distill';
  const excerpt = clean(selection.excerpt);
  const quote = clean(selection.quote);
  const userNote = clean(selection.userNote);
  const timestamp = clean(selection.timestamp);
  const selectedText =
    excerpt || (selection.includeTitle ? entry.description : undefined);

  const packet: AgentFeedPacket = {
    source: AGENT_FEED_SOURCE,
    version: 1,
    intent,
    type: entry.type,
    id: entry.id,
    title: entry.title,
    creators: entry.creators,
    language: entry.originalLanguage,
    region: entry.region,
    tags: [...entry.genres, ...entry.tags],
    url: selection.url || catalogPath(entry.id),
    links: entry.externalUrls,
    capturedAt: selection.capturedAt ?? new Date().toISOString(),
  };

  if (selectedText) packet.selectedText = selectedText;
  if (quote) packet.quote = quote;
  if (userNote) packet.userNote = userNote;
  if (timestamp) packet.timestamp = timestamp;

  return {
    packet,
    markdown: renderMarkdown(entry, packet),
  };
}

export function catalogPath(id: string): string {
  return `/title/${id}`;
}

function clean(value: string | undefined): string | undefined {
  const next = value?.trim();
  return next ? next : undefined;
}

function renderMarkdown(entry: CatalogEntry, packet: AgentFeedPacket): string {
  const language = getLanguage(entry.originalLanguage);
  const region = getRegion(entry.region);
  const links = Object.entries(packet.links)
    .filter((row): row is [string, string] => Boolean(row[1]))
    .map(([key, href]) => `- ${labelLink(key)}: ${href}`);

  const lines = [
    '# Distill a source',
    '',
    INTENT_PROMPTS[packet.intent],
    '',
    `Intent: ${packet.intent}`,
    `Captured: ${packet.capturedAt}`,
    `Source: ${packet.source}`,
    '',
    '## Catalogue card',
    '',
    `- Title: ${packet.title}`,
    `- Type: ${packet.type}`,
    `- Creators: ${packet.creators.join(', ')}`,
    `- Language: ${language.name} (${packet.language})`,
    `- Region: ${region.name}`,
    `- Tags: ${packet.tags.join(', ')}`,
    `- Catalogue: ${packet.url}`,
  ];

  if (packet.timestamp) {
    lines.push(`- Timestamp / locus: ${packet.timestamp}`);
  }

  if (packet.userNote) {
    lines.push('', '## Why this was sent', '', packet.userNote);
  }

  if (packet.quote) {
    lines.push('', '## Quote', '', blockQuote(packet.quote));
  }

  if (packet.selectedText) {
    lines.push('', '## Selected text', '', packet.selectedText);
  }

  if (links.length > 0) {
    lines.push('', '## Open externally', '', ...links);
  }

  lines.push(
    '',
    '## Constraint',
    '',
    'Metadata and deep links only. Do not fetch or host copyrighted audio files.',
    '',
  );

  return lines.join('\n');
}

function blockQuote(text: string): string {
  return text
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n');
}

function labelLink(key: string): string {
  switch (key) {
    case 'rss':
      return 'RSS';
    case 'youtube':
      return 'YouTube';
    case 'librivox':
      return 'LibriVox';
    case 'podcastIndex':
      return 'Podcast Index';
    case 'store':
      return 'Store / publisher';
    default:
      return 'Website';
  }
}
