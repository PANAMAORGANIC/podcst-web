export const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 1.75, 2] as const;

export type PlaybackRate = (typeof PLAYBACK_RATES)[number];

export type PlayableKind = 'audio' | 'youtube';

/** A streamable episode. Enclosure / watch URL only — never a hosted file. */
export type Playable = {
  id: string;
  showId: string;
  showTitle: string;
  title: string;
  kind: PlayableKind;
  publishedAt?: string;
  durationSeconds?: number;
  enclosureUrl?: string;
  sourceUrl?: string;
  artwork?: string;
  youtubeId?: string;
};

export type EpisodeProgress = {
  currentTime: number;
  duration: number;
  updatedAt: number;
};

export type PersistedPlayer = {
  version: 1;
  queue: Playable[];
  index: number;
  rate: PlaybackRate;
  muted: boolean;
  volume: number;
  progress: Record<string, EpisodeProgress>;
};

export type EpisodesResponse = {
  showId: string;
  showTitle: string;
  type: 'podcast' | 'audiobook' | 'youtube';
  source: 'rss' | 'youtube' | 'none';
  episodes: Playable[];
  links: {
    rss?: string;
    youtube?: string;
    store?: string;
    website?: string;
    librivox?: string;
  };
  message?: string;
};
