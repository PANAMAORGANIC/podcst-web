'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CatalogRail as Rail } from '@/catalog/rails';
import { useHydrateLikes, useLikes } from '@/likes/useLikes';
import { CatalogRail } from './CatalogRail';

interface RecommendResponse {
  rails?: Rail[];
}

export function BecauseYouLikeRails({
  seedIds,
  initialRails = [],
  heading,
}: {
  seedIds: string[];
  initialRails?: Rail[];
  heading?: string;
}) {
  useHydrateLikes(seedIds);
  const liked = useLikes((state) => state.ids);
  const ready = useLikes((state) => state.ready);
  const active = useMemo(() => {
    const extra = liked.filter((id) => !seedIds.includes(id));
    return [...seedIds, ...extra].slice(0, 12);
  }, [liked, seedIds]);
  const [rails, setRails] = useState<Rail[]>(initialRails);
  const key = active.join(',');

  useEffect(() => {
    if (!ready || !key) return;
    const controller = new AbortController();
    void fetch(`/api/recommend?seeds=${encodeURIComponent(key)}&limit=8`, {
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((data: RecommendResponse) => {
        if (Array.isArray(data.rails)) setRails(data.rails);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [key, ready]);

  if (!rails.length) return null;

  return (
    <div className="because-you-like">
      {heading ? (
        <header className="page-header because-header">
          <p className="eyebrow">Recommendations</p>
          <h2>{heading}</h2>
        </header>
      ) : null}
      {rails.map((rail) => (
        <CatalogRail key={rail.id} rail={rail} />
      ))}
    </div>
  );
}
