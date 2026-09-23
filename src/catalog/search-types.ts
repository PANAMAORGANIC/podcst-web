import type { Playable } from '@/player/types';
import type { CatalogType } from './types';

export const SEARCH_TABS = ['shows', 'episodes', 'themes'] as const;
export type SearchTab = (typeof SEARCH_TABS)[number];

export type SearchShowHit = {
  id: string;
  title: string;
  type: CatalogType;
  creators: string[];
  language: string;
  tags: string[];
  boosted: boolean;
  cover?: string;
};

export type SearchEpisodeHit = {
  id: string;
  title: string;
  showId: string;
  showTitle: string;
  kind: Playable['kind'];
  publishedAt?: string;
  durationSeconds?: number;
  sourceUrl?: string;
  artwork?: string;
  youtubeId?: string;
  enclosureUrl?: string;
  description?: string;
};

export type SearchThemeHit = {
  id: string;
  label: string;
  kind: 'rail' | 'tag' | 'topic';
  count: number;
  query: string;
};

export type WarSearchResult = {
  q: string;
  mode: 'seed' | 'full';
  shows: SearchShowHit[];
  episodes: SearchEpisodeHit[];
  themes: SearchThemeHit[];
  totals: { shows: number; episodes: number; themes: number };
  hint?: string;
};
