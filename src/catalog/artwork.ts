import { isRemoteArtworkUrl } from './cover';
import type { CatalogEntry } from './types';

const itunesCache = new Map<string, string | null>();

export function appleIdFromCatalogId(id: string): string | null {
  const match = /^it-(\d{5,12})$/.exec(id);
  return match?.[1] ?? null;
}

export async function lookupItunesArtwork(
  appleId: string,
): Promise<string | null> {
  if (itunesCache.has(appleId)) return itunesCache.get(appleId) ?? null;
  try {
    const response = await fetch(
      `https://itunes.apple.com/lookup?id=${encodeURIComponent(appleId)}`,
      {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(4000),
      },
    );
    if (!response.ok) {
      itunesCache.set(appleId, null);
      return null;
    }
    const data = (await response.json()) as {
      results?: Array<{ artworkUrl600?: string; artworkUrl100?: string }>;
    };
    const hit = data.results?.[0];
    const url = hit?.artworkUrl600 || hit?.artworkUrl100;
    const art = isRemoteArtworkUrl(url) ? url : null;
    itunesCache.set(appleId, art);
    return art;
  } catch {
    itunesCache.set(appleId, null);
    return null;
  }
}

/** Publisher/Apple artwork only — never a local audio file. */
export async function resolveArtworkUrl(
  entry: CatalogEntry,
): Promise<string | null> {
  const appleId = appleIdFromCatalogId(entry.id);
  if (appleId) {
    const itunes = await lookupItunesArtwork(appleId);
    if (itunes) return itunes;
  }
  if (isRemoteArtworkUrl(entry.coverArt)) return entry.coverArt;
  return null;
}
