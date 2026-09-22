import type {
  CatalogEntry,
  CatalogSignals,
  CatalogType,
  ExternalUrls,
  LocalizedText,
} from '../types';

interface EntryDraft {
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
  countryCode: string;
  urls: ExternalUrls;
  coverArt?: string;
  signals: CatalogSignals;
  english?: LocalizedText;
  year?: number;
  episodeCount?: number;
  durationHours?: number;
}

export function entry(draft: EntryDraft): CatalogEntry {
  return {
    id: draft.id,
    type: draft.type,
    title: draft.title,
    originalLanguage: draft.language,
    creators: draft.creators,
    description: draft.description,
    tags: draft.tags,
    genres: draft.genres,
    region: draft.region,
    country: draft.country,
    countryCode: draft.countryCode,
    externalUrls: draft.urls,
    coverArt: draft.coverArt,
    signals: draft.signals,
    year: draft.year,
    episodeCount: draft.episodeCount,
    durationHours: draft.durationHours,
    translations: draft.english ? { en: draft.english } : undefined,
  };
}

export function podcast(draft: Omit<EntryDraft, 'type'>): CatalogEntry {
  return entry({ ...draft, type: 'podcast' });
}

export function audiobook(draft: Omit<EntryDraft, 'type'>): CatalogEntry {
  return entry({ ...draft, type: 'audiobook' });
}

export function youtube(draft: Omit<EntryDraft, 'type'>): CatalogEntry {
  return entry({ ...draft, type: 'youtube' });
}
