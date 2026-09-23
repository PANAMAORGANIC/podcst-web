'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  fromPublicCatalogItem,
  type PublicCatalogItem,
} from '@/catalog/public';
import type { CatalogRail as Rail } from '@/catalog/rails';
import {
  useHydrateSubscriptions,
  useSubscriptions,
} from '@/subscriptions/useSubscriptions';
import { CatalogRail } from './CatalogRail';

export function LibraryRail() {
  useHydrateSubscriptions();
  const ready = useSubscriptions((state) => state.ready);
  const ids = useSubscriptions((state) => state.ids);
  const [rail, setRail] = useState<Rail | null>(null);
  const key = useMemo(() => ids.slice(0, 12).join(','), [ids]);

  useEffect(() => {
    if (!ready || !key) {
      setRail(null);
      return;
    }
    const controller = new AbortController();
    void fetch(`/api/catalog?ids=${encodeURIComponent(key)}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error('failed');
        return response.json() as Promise<{ items?: PublicCatalogItem[] }>;
      })
      .then((data) => {
        const items = (data.items ?? []).map(fromPublicCatalogItem);
        if (!items.length) {
          setRail(null);
          return;
        }
        setRail({
          id: 'shelf',
          title: 'On your shelf',
          lede: 'Shows you subscribed to on this phone. Open Shelf for the full list.',
          items,
        });
      })
      .catch(() => {
        if (!controller.signal.aborted) setRail(null);
      });
    return () => controller.abort();
  }, [key, ready]);

  if (!rail) return null;
  return <CatalogRail rail={rail} moreHref="/shelf" moreLabel="Open Shelf" />;
}
