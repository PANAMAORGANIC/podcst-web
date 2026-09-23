import type { CatalogType, ExternalUrls } from '@/catalog/types';

export const AGENT_FEED_SOURCE = 'world-audio-repository';

/** Dedicated Grok Bot agent for World Audio Repository — never a generic feed. */
export const WAR_GROK_AGENT_ID = '5140399';
export const WAR_GROK_AGENT_NAME = 'WAR';

export const AGENT_INTENTS = ['distill', 'research', 'remember'] as const;

export type AgentIntent = (typeof AGENT_INTENTS)[number];

export interface AgentFeedPacket {
  source: typeof AGENT_FEED_SOURCE;
  version: 1;
  intent: AgentIntent;
  type: CatalogType;
  id: string;
  title: string;
  creators: string[];
  language: string;
  region: string;
  tags: string[];
  url: string;
  links: ExternalUrls;
  selectedText?: string;
  quote?: string;
  userNote?: string;
  timestamp?: string;
  capturedAt: string;
  /** Playing (or listed) episode — metadata and source URL only. */
  episode?: AgentFeedEpisode;
  /** Target Grok Bot agent. Ask WAR always sets 5140399. */
  agent?: { id: string; name: string };
}

export interface AgentFeedEpisode {
  id: string;
  title: string;
  showId: string;
  showTitle: string;
  kind: 'audio' | 'youtube';
  publishedAt?: string;
  durationSeconds?: number;
  sourceUrl?: string;
  youtubeId?: string;
  description?: string;
}

export interface AgentFeedSelection {
  includeTitle: boolean;
  excerpt?: string;
  quote?: string;
  userNote?: string;
  timestamp?: string;
  url?: string;
  intent?: AgentIntent;
  capturedAt?: string;
  episode?: AgentFeedEpisode;
  agent?: { id: string; name: string };
}

export interface AgentFeedBundle {
  packet: AgentFeedPacket;
  markdown: string;
}
