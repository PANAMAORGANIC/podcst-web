import type { CatalogEntry } from '../types';
import { AUDIOBOOKS } from './audiobooks';
import { PODCASTS } from './podcasts';
import { YOUTUBE } from './youtube';

/** Editorial seed. Ingested titles live in the gzip/json snapshot and merge at read time. */
export const SEED_CATALOG: CatalogEntry[] = [
  ...PODCASTS,
  ...AUDIOBOOKS,
  ...YOUTUBE,
];

/** @deprecated Use getCatalog() so ingested titles are included. */
export const CATALOG = SEED_CATALOG;
