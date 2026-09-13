import { coverUrl } from '@/catalog/cover';
import type { CatalogEntry } from '@/catalog/types';

export function CoverArt({
  entry,
  priority = false,
  size = 'card',
}: {
  entry: CatalogEntry;
  priority?: boolean;
  size?: 'card' | 'hero';
}) {
  return (
    // biome-ignore lint/performance/noImgElement: generated SVG covers
    <img
      src={coverUrl(entry)}
      alt=""
      width={size === 'hero' ? 420 : 320}
      height={size === 'hero' ? 420 : 320}
      className={`cover-art cover-${size}`}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
    />
  );
}
