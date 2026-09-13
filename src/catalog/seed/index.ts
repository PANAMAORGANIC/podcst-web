import type { CatalogEntry } from '../types';
import { AUDIOBOOKS } from './audiobooks';
import { PODCASTS } from './podcasts';
import { YOUTUBE } from './youtube';

export const CATALOG: CatalogEntry[] = [...PODCASTS, ...AUDIOBOOKS, ...YOUTUBE];

const BY_ID = new Map(CATALOG.map((item) => [item.id, item]));

export function getEntry(id: string): CatalogEntry | undefined {
  return BY_ID.get(id);
}

export function catalogStats() {
  const languages = new Set(CATALOG.map((item) => item.originalLanguage));
  const regions = new Set(CATALOG.map((item) => item.region));
  const types = {
    podcast: CATALOG.filter((item) => item.type === 'podcast').length,
    audiobook: CATALOG.filter((item) => item.type === 'audiobook').length,
    youtube: CATALOG.filter((item) => item.type === 'youtube').length,
  };
  return {
    titles: CATALOG.length,
    languages: languages.size,
    regions: regions.size,
    types,
  };
}
