export const CATALOG_TYPES = ['podcast', 'audiobook', 'youtube'] as const;

export type CatalogType = (typeof CATALOG_TYPES)[number];

export const CATALOG_TYPE_LABELS: Record<CatalogType, string> = {
  podcast: 'Podcast',
  audiobook: 'Audiobook',
  youtube: 'YouTube',
};

export interface ExternalUrls {
  rss?: string;
  youtube?: string;
  website?: string;
  store?: string;
  librivox?: string;
  podcastIndex?: string;
}

export interface LocalizedText {
  title: string;
  description: string;
}

export interface CatalogSignals {
  /** 0–100 editorial popularity / reach signal */
  popularity: number;
  /** 0–100 linguistic, regional, or niche diversity weight */
  diversity: number;
}

export interface CatalogEntry {
  id: string;
  type: CatalogType;
  title: string;
  originalLanguage: string;
  creators: string[];
  description: string;
  tags: string[];
  genres: string[];
  region: string;
  country: string;
  countryCode: string;
  externalUrls: ExternalUrls;
  coverArt?: string;
  signals: CatalogSignals;
  year?: number;
  episodeCount?: number;
  durationHours?: number;
  translations?: {
    en?: LocalizedText;
  };
}

export interface CatalogQuery {
  q?: string;
  type?: CatalogType | 'all';
  language?: string;
  region?: string;
  genre?: string;
  sort?: CatalogSort;
  limit?: number;
}

export type CatalogSort =
  | 'diversity'
  | 'popularity'
  | 'title'
  | 'language'
  | 'relevance';

export interface CatalogResult {
  items: CatalogEntry[];
  total: number;
}
