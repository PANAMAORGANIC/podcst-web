'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  SEARCH_TABS,
  type SearchTab,
  type WarSearchResult,
} from '@/catalog/search-types';
import { useHydrateLikes, useLikes } from '@/likes/useLikes';
import { formatClock, formatPublished } from '@/player/format';
import { usePlayer } from '@/player/store';
import {
  useHydrateSubscriptions,
  useSubscriptions,
} from '@/subscriptions/useSubscriptions';
import { SearchBox } from './SearchBox';

export function SearchResults({ q, tab }: { q: string; tab: SearchTab }) {
  const router = useRouter();
  const liked = useLikes((state) => state.ids);
  const likedReady = useLikes((state) => state.ready);
  const subs = useSubscriptions((state) => state.ids);
  const subsReady = useSubscriptions((state) => state.ready);
  const playItem = usePlayer((state) => state.playItem);
  useHydrateLikes([]);
  useHydrateSubscriptions();
  const [data, setData] = useState<WarSearchResult | null>(null);
  const [failed, setFailed] = useState(false);

  const boost = useMemo(
    () => [...new Set([...liked, ...subs])].slice(0, 40).join(','),
    [liked, subs],
  );

  useEffect(() => {
    if (!q.trim()) {
      setData(null);
      setFailed(false);
      return;
    }
    if (!likedReady || !subsReady) return;
    const controller = new AbortController();
    setFailed(false);
    const handle = window.setTimeout(() => {
      void fetch(
        `/api/search?q=${encodeURIComponent(q)}&boost=${encodeURIComponent(boost)}`,
        { signal: controller.signal },
      )
        .then((response) => {
          if (!response.ok) throw new Error('failed');
          return response.json() as Promise<WarSearchResult>;
        })
        .then(setData)
        .catch(() => {
          if (!controller.signal.aborted) setFailed(true);
        });
    }, 80);
    return () => {
      controller.abort();
      window.clearTimeout(handle);
    };
  }, [q, boost, likedReady, subsReady]);

  function setTab(next: SearchTab) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (next !== 'shows') params.set('tab', next);
    router.replace(`/search?${params.toString()}`);
  }

  const empty = !q.trim();
  const current = data
    ? tab === 'shows'
      ? data.shows
      : tab === 'episodes'
        ? data.episodes
        : data.themes
    : [];

  return (
    <div className="page-search">
      <header className="page-header">
        <p className="eyebrow">Search</p>
        <h1>{q ? `Results for “${q}”` : 'Search shows, episodes, themes'}</h1>
        <p className="lede">
          Find a title, an episode phrase, or a topic like soil or compost. Seed
          mode stays on the library catalog — we never host audio.
        </p>
        <SearchBox size="hero" defaultValue={q} />
      </header>

      <div className="search-tabs" role="tablist" aria-label="Result type">
        {SEARCH_TABS.map((value) => {
          const count =
            value === 'shows'
              ? (data?.totals.shows ?? 0)
              : value === 'episodes'
                ? (data?.totals.episodes ?? 0)
                : (data?.totals.themes ?? 0);
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              className={`search-tab${tab === value ? ' is-active' : ''}`}
              onClick={() => setTab(value)}
            >
              {value === 'shows'
                ? 'Shows'
                : value === 'episodes'
                  ? 'Episodes'
                  : 'Themes'}
              <span>{count}</span>
            </button>
          );
        })}
      </div>

      {data?.hint ? <p className="search-hint">{data.hint}</p> : null}

      {failed ? (
        <p className="lede">
          Search failed. Try again, or open a library title.
        </p>
      ) : null}

      {empty ? (
        <p className="search-empty">
          Try <Link href="/search?q=soil">soil</Link>,{' '}
          <Link href="/search?q=compost">compost</Link>,{' '}
          <Link href="/search?q=Radio%20Semilla">Radio Semilla</Link>, or{' '}
          <Link href="/search?q=Acres">Acres</Link>.
        </p>
      ) : !data ? (
        <p className="lede">Searching the library…</p>
      ) : current.length === 0 ? (
        <p className="search-empty">
          No {tab} matched “{q}”. Try soil, compost, or a show name from your
          library.
        </p>
      ) : tab === 'shows' && data ? (
        <ul className="search-hits">
          {data.shows.map((item) => (
            <li key={item.id}>
              <Link href={`/title/${encodeURIComponent(item.id)}`}>
                <strong>
                  {item.title}
                  {item.boosted ? <em>Favorite</em> : null}
                </strong>
                <span>
                  {item.type}
                  {item.creators[0] ? ` · ${item.creators[0]}` : ''}
                  {item.tags[0] ? ` · ${item.tags[0]}` : ''}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : tab === 'episodes' && data ? (
        <ul className="search-hits">
          {data.episodes.map((item) => (
            <li key={item.id} className="search-episode">
              <Link href={`/title/${encodeURIComponent(item.showId)}`}>
                <strong>{item.title}</strong>
                <span>
                  {item.showTitle}
                  {item.publishedAt
                    ? ` · ${formatPublished(item.publishedAt)}`
                    : ''}
                  {item.durationSeconds
                    ? ` · ${formatClock(item.durationSeconds)}`
                    : ''}
                </span>
              </Link>
              {item.enclosureUrl || item.youtubeId ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => playItem(item)}
                >
                  Play
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <ul className="search-themes">
          {data?.themes.map((theme) => (
            <li key={theme.id}>
              <Link
                className="search-theme"
                href={`/search?q=${encodeURIComponent(theme.query)}&tab=shows`}
              >
                {theme.label}
                <span>
                  {theme.kind} · {theme.count}{' '}
                  {theme.count === 1 ? 'show' : 'shows'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
