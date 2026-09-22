'use client';

import { useEffect, useState } from 'react';
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
  const generated = generatedCoverPath(entry.id);
  const preferred = coverUrl(entry);
  const [src, setSrc] = useState(preferred);

  useEffect(() => {
    setSrc(preferred);
  }, [preferred]);

  return (
    // biome-ignore lint/performance/noImgElement: remote artwork + generated SVG fallback
    <img
      src={src}
      alt={alt}
      width={size === 'hero' ? 420 : 120}
      height={size === 'hero' ? 420 : 120}
      className={`cover-art cover-${size}`}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      onError={() => {
        if (src !== generated) setSrc(generated);
      }}
    />
  );
}
