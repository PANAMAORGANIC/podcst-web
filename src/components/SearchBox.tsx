'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import type { WarSearchResult } from '@/catalog/search-types';
import { SearchIcon } from './Icons';

interface SearchBoxProps {
  defaultValue?: string;
  size?: 'hero' | 'header';
}

export function SearchBox({
  defaultValue = '',
  size = 'header',
}: SearchBoxProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [term, setTerm] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [data, setData] = useState<WarSearchResult | null>(null);

  useEffect(() => {
    setTerm(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === '/' && !isTyping(event)) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const q = term.trim();
    if (q.length < 2) {
      setData(null);
      return;
    }
    const handle = window.setTimeout(async () => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!response.ok) return;
      const next = (await response.json()) as WarSearchResult;
      setData(next);
      setActive(0);
    }, 200);
    return () => window.clearTimeout(handle);
  }, [term]);

  const suggestions = [
    ...(data?.shows.slice(0, 4).map((item) => ({
      href: `/title/${encodeURIComponent(item.id)}`,
      title: item.title,
      meta: `Show · ${item.type}`,
    })) ?? []),
    ...(data?.episodes.slice(0, 3).map((item) => ({
      href: `/title/${encodeURIComponent(item.showId)}`,
      title: item.title,
      meta: `Episode · ${item.showTitle}`,
    })) ?? []),
    ...(data?.themes.slice(0, 2).map((item) => ({
      href: `/search?q=${encodeURIComponent(item.query)}&tab=themes`,
      title: item.label,
      meta: `Theme · ${item.count} shows`,
    })) ?? []),
  ];

  return (
    <div className={`search-box search-box-${size}`}>
      <search>
        <form action="/search" method="get">
          <label className="sr-only" htmlFor={`war-search-${size}`}>
            Search shows, episodes, and themes
          </label>
          <SearchIcon className="search-box-icon" />
          <input
            id={`war-search-${size}`}
            ref={inputRef}
            name="q"
            type="search"
            value={term}
            autoComplete="off"
            placeholder={
              size === 'header'
                ? 'Shows, episodes, themes'
                : 'Search shows, episodes, themes…'
            }
            aria-controls={listId}
            onChange={(event) => {
              setTerm(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 120)}
            onKeyDown={(event) => {
              if (!suggestions.length) return;
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setActive((index) => (index + 1) % suggestions.length);
              }
              if (event.key === 'ArrowUp') {
                event.preventDefault();
                setActive(
                  (index) =>
                    (index - 1 + suggestions.length) % suggestions.length,
                );
              }
              if (event.key === 'Enter' && open && suggestions[active]) {
                event.preventDefault();
                router.push(suggestions[active].href);
              }
            }}
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </search>
      {open && (suggestions.length > 0 || term.trim().length >= 2) ? (
        <ul id={listId} className="search-suggest">
          {suggestions.map((item, index) => (
            <li key={`${item.href}-${item.title}`}>
              <Link
                href={item.href}
                data-active={index === active}
                onMouseDown={(event) => event.preventDefault()}
              >
                <span className="suggest-title">{item.title}</span>
                <span className="suggest-meta">{item.meta}</span>
              </Link>
            </li>
          ))}
          <li>
            <Link
              href={`/search?q=${encodeURIComponent(term.trim())}`}
              onMouseDown={(event) => event.preventDefault()}
            >
              <span className="suggest-title">See all results</span>
              <span className="suggest-meta">Shows · Episodes · Themes</span>
            </Link>
          </li>
        </ul>
      ) : null}
    </div>
  );
}

function isTyping(event: KeyboardEvent) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  );
}
