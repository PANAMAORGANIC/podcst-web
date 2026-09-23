'use client';

import { useState } from 'react';
import { coverUrl, generatedCoverPath } from '@/catalog/cover';
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
  const preferred = coverUrl(entry);
  const fallback = generatedCoverPath(entry.id);
  const [src, setSrc] = useState(preferred);

  return (
    <div className={`cover-frame cover-${size}`}>
      {/* biome-ignore lint/performance/noImgElement: publisher artwork or same-origin cover route */}
      <img
        src={src}
        alt={alt}
        width={size === 'hero' ? 420 : 120}
        height={size === 'hero' ? 420 : 120}
        className="cover-art"
        decoding="sync"
        fetchPriority={priority ? 'high' : 'auto'}
        referrerPolicy="no-referrer"
        onError={() => {
          if (src !== fallback) setSrc(fallback);
        }}
      />
    </div>
  );
}
