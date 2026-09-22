import { type PersistedPlayer, PLAYBACK_RATES, type Playable } from './types';

export const PLAYER_STORAGE_KEY = 'war-player-v1';

function isPlayable(value: unknown): value is Playable {
  if (!value || typeof value !== 'object') return false;
  const row = value as Playable;
  return (
    typeof row.id === 'string' &&
    typeof row.showId === 'string' &&
    typeof row.showTitle === 'string' &&
    typeof row.title === 'string' &&
    (row.kind === 'audio' || row.kind === 'youtube')
  );
}

export function emptyPersisted(): PersistedPlayer {
  return {
    version: 1,
    queue: [],
    index: 0,
    rate: 1,
    muted: false,
    volume: 1,
    progress: {},
  };
}

export function parsePersisted(raw: string | null): PersistedPlayer {
  const fallback = emptyPersisted();
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as Partial<PersistedPlayer>;
    const queue = Array.isArray(parsed.queue)
      ? parsed.queue.filter(isPlayable).slice(0, 80)
      : [];
    const rate = PLAYBACK_RATES.includes(parsed.rate as never)
      ? (parsed.rate as PersistedPlayer['rate'])
      : 1;
    const volume =
      typeof parsed.volume === 'number' &&
      parsed.volume >= 0 &&
      parsed.volume <= 1
        ? parsed.volume
        : 1;
    const progress: PersistedPlayer['progress'] = {};
    if (parsed.progress && typeof parsed.progress === 'object') {
      for (const [id, row] of Object.entries(parsed.progress)) {
        if (
          row &&
          typeof row.currentTime === 'number' &&
          typeof row.duration === 'number'
        ) {
          progress[id] = {
            currentTime: row.currentTime,
            duration: row.duration,
            updatedAt: row.updatedAt ?? 0,
          };
        }
      }
    }
    return {
      version: 1,
      queue,
      index:
        typeof parsed.index === 'number'
          ? Math.min(
              Math.max(0, Math.floor(parsed.index)),
              Math.max(0, queue.length - 1),
            )
          : 0,
      rate,
      muted: Boolean(parsed.muted),
      volume,
      progress,
    };
  } catch {
    return fallback;
  }
}

export function readPersisted(): PersistedPlayer {
  if (typeof window === 'undefined') return emptyPersisted();
  return parsePersisted(window.localStorage.getItem(PLAYER_STORAGE_KEY));
}

export function writePersisted(state: PersistedPlayer) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(state));
}
