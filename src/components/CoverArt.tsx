'use client';

import { generatedCoverPath } from '@/catalog/cover';
import type { CatalogEntry } from '@/catalog/types';

export function CoverArt({
  entry,
  priority = false,
  size = 'card',
  alt = '',
}: {
  entry: CatalogEntry;
  priority?: boolean;
  size?: 'card' | 'hero';
  alt?: string;
}) {
  const src = generatedCoverPath(entry.id);

  return (
    <div className={`cover-frame cover-${size}`}>
      {/* biome-ignore lint/performance/noImgElement: same-origin cover route + generated SVG */}
      <img
        src={src}
        alt={alt}
        width={size === 'hero' ? 420 : 120}
        height={size === 'hero' ? 420 : 120}
        className="cover-art"
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
