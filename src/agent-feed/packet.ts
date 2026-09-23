import { getLanguage } from '@/catalog/languages';
import { getRegion } from '@/catalog/regions';
import type { CatalogEntry } from '@/catalog/types';
import type { Playable } from '@/player/types';
import {
  AGENT_FEED_SOURCE,
  type AgentFeedBundle,
  type AgentFeedEpisode,
  type AgentFeedPacket,
  type AgentFeedSelection,
  type AgentIntent,
  WAR_GROK_AGENT_ID,
  WAR_GROK_AGENT_NAME,
} from './types';

/** Documented Grok Bot sidebar deep link — this WAR agent only. */
export function grokBotSidebarUrl(agentId: string = WAR_GROK_AGENT_ID): string {
  return `grokbot://app/v1/sidebar?agent=${encodeURIComponent(agentId)}`;
}

export function episodeToFeed(episode: Playable): AgentFeedEpisode {
  return {
    id: episode.id,
    title: episode.title,
    showId: episode.showId,
    showTitle: episode.showTitle,
    kind: episode.kind,
    publishedAt: episode.publishedAt,
    durationSeconds: episode.durationSeconds,
    sourceUrl: episode.sourceUrl,
    youtubeId: episode.youtubeId,
    description: episode.description,
  };
}

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
  if (selection.episode) packet.episode = selection.episode;
  if (selection.agent) packet.agent = selection.agent;

  return {
    packet,
    markdown: renderMarkdown(entry, packet),
  };
}

export function buildAskWarFeed(
  entry: CatalogEntry,
  episode: Playable,
  options: {
    question?: string;
    timestamp?: string;
    url?: string;
    capturedAt?: string;
  } = {},
): AgentFeedBundle {
  const question = clean(options.question);
  const userNote = question ? `RED's question: ${question}` : undefined;
  return buildAgentFeed(entry, {
    includeTitle: true,
    excerpt: episode.description || entry.description,
    userNote,
    timestamp: options.timestamp,
    url: options.url,
    intent: 'research',
    capturedAt: options.capturedAt,
    episode: episodeToFeed(episode),
    agent: { id: WAR_GROK_AGENT_ID, name: WAR_GROK_AGENT_NAME },
  });
}

export function stubEntryFromEpisode(episode: Playable): CatalogEntry {
  return {
    id: episode.showId,
    type: episode.kind === 'youtube' ? 'youtube' : 'podcast',
    title: episode.showTitle,
    originalLanguage: 'en',
    creators: [],
    description: episode.description ?? '',
    tags: [],
    genres: [],
    region: '',
    country: '',
    countryCode: '',
    externalUrls: episode.sourceUrl
      ? episode.kind === 'youtube'
        ? { youtube: episode.sourceUrl }
        : { website: episode.sourceUrl }
      : {},
    signals: { popularity: 0, diversity: 0 },
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

  const isAskWar = packet.agent?.id === WAR_GROK_AGENT_ID;
  const lines = [
    isAskWar ? '# Ask WAR' : '# Distill a source',
    '',
    isAskWar
      ? `You are the WAR agent (id ${WAR_GROK_AGENT_ID}) for World Audio Repository. Answer about this episode — themes, authors, books, terms. Use only the metadata and source links below.`
      : INTENT_PROMPTS[packet.intent],
    '',
    `Intent: ${packet.intent}`,
    `Captured: ${packet.capturedAt}`,
    `Source: ${packet.source}`,
  ];

  if (packet.agent) {
    lines.push(`Agent: ${packet.agent.name} (${packet.agent.id})`);
  }

  if (packet.episode) {
    const ep = packet.episode;
    lines.push(
      '',
      '## Episode',
      '',
      `- Title: ${ep.title}`,
      `- Show: ${ep.showTitle}`,
      `- Episode id: ${ep.id}`,
      `- Kind: ${ep.kind}`,
    );
    if (ep.publishedAt) lines.push(`- Published: ${ep.publishedAt}`);
    if (ep.durationSeconds != null) {
      lines.push(`- Duration seconds: ${ep.durationSeconds}`);
    }
    if (ep.sourceUrl) lines.push(`- Source: ${ep.sourceUrl}`);
    if (ep.youtubeId) lines.push(`- YouTube: ${ep.youtubeId}`);
    if (ep.description) {
      lines.push('', '## Episode notes', '', ep.description);
    }
  }

  lines.push(
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
  );

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
  );
  if (isAskWar) {
    lines.push(
      'If the listener pasted a question, answer that first. Otherwise propose useful angles on the episode.',
    );
  }
  lines.push('');

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
