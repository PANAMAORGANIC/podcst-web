import { coverUrl } from '@/catalog/cover';
import type {
  CatalogEntry,
  CatalogSignals,
  CatalogType,
  ExternalUrls,
} from '@/catalog/types';

/** Stable public catalogue record. Metadata and deep links only. */
export type PublicCatalogItem = {
  id: string;
  type: CatalogType;
  title: string;
  language: string;
  creators: string[];
  description: string;
  tags: string[];
  genres: string[];
  region: string;
  country: string;
  urls: ExternalUrls;
  cover: string;
  signals: CatalogSignals;
};

export function toPublicCatalogItem(entry: CatalogEntry): PublicCatalogItem {
  return {
    id: entry.id,
    type: entry.type,
    title: entry.title,
    language: entry.originalLanguage,
    creators: entry.creators,
    description: entry.description,
    tags: entry.tags,
    genres: entry.genres,
    region: entry.region,
    country: entry.country,
    urls: entry.externalUrls,
    cover: coverUrl(entry),
    signals: entry.signals,
  };
}

export const CATALOG_API_MAX_LIMIT = 100;
export const CATALOG_API_DEFAULT_LIMIT = 24;

export function clampCatalogLimit(raw: number | undefined): number {
  if (!raw || !Number.isFinite(raw) || raw <= 0) {
    return CATALOG_API_DEFAULT_LIMIT;
  }
  return Math.min(CATALOG_API_MAX_LIMIT, Math.floor(raw));
}

export function clampCatalogOffset(raw: number | undefined): number {
  if (!raw || !Number.isFinite(raw) || raw < 0) return 0;
  return Math.floor(raw);
}
