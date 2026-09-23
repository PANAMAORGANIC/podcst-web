import type { CatalogEntry, CatalogType } from './types';

const TYPE_MARK: Record<CatalogType, string> = {
  podcast: 'POD',
  audiobook: 'BOOK',
  youtube: 'YT',
};

const PALETTE = [
  ['#1f3a5f', '#e7c27d'],
  ['#3d1f2b', '#e08b6c'],
  ['#1b3d32', '#c5d86d'],
  ['#2c2156', '#d4a5ff'],
  ['#4a2c0a', '#f0c27b'],
  ['#163a4a', '#7fd1c5'],
  ['#3f1d1d', '#f2a65a'],
  ['#1d2f4a', '#8eb8e5'],
  ['#2e3a1f', '#d7e08b'],
  ['#3a2148', '#f0a6ca'],
];

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function coverPalette(id: string): { bg: string; fg: string } {
  const pair = PALETTE[hash(id) % PALETTE.length];
  return { bg: pair[0], fg: pair[1] };
}

export function generatedCoverPath(id: string): string {
  return `/api/cover/${encodeURIComponent(id)}`;
}

export function isRemoteArtworkUrl(url: string | undefined): url is string {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function coverUrl(entry: CatalogEntry): string {
  const remote = entry.coverArt;
  if (isRemoteArtworkUrl(remote)) return remote;
  return generatedCoverPath(entry.id);
}

export function renderCoverSvg(entry: CatalogEntry): string {
  const { bg, fg } = coverPalette(entry.id);
  const initials = entry.title
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase();
  const title = escapeXml(entry.title);
  const lang = escapeXml(entry.originalLanguage.toUpperCase());
  const mark = TYPE_MARK[entry.type];

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" role="img" aria-label="${title}">
  <rect width="600" height="600" fill="${bg}"/>
  <rect x="28" y="28" width="544" height="544" fill="none" stroke="${fg}" stroke-width="2" opacity="0.45"/>
  <text x="48" y="80" fill="${fg}" font-family="Georgia, serif" font-size="22" letter-spacing="4">${mark}</text>
  <text x="552" y="80" fill="${fg}" font-family="Georgia, serif" font-size="22" text-anchor="end">${lang}</text>
  <text x="300" y="330" fill="${fg}" font-family="Georgia, serif" font-size="140" text-anchor="middle">${escapeXml(initials)}</text>
  <text x="48" y="548" fill="${fg}" font-family="Georgia, serif" font-size="22">${title.slice(0, 42)}</text>
</svg>`;
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
