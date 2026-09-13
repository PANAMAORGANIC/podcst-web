import type { CatalogType, ExternalUrls } from '@/catalog/types';

export const AGENT_FEED_SOURCE = 'world-audio-repository';

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
}

export interface AgentFeedBundle {
  packet: AgentFeedPacket;
  markdown: string;
}
