'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import type { CatalogEntry } from '@/catalog/types';
import { SearchIcon } from './Icons';

interface Suggestion {
  id: string;
  title: string;
  type: CatalogEntry['type'];
  creators: string[];
}

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
  const [results, setResults] = useState<Suggestion[]>([]);

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
      setResults([]);
      return;
    }
    const handle = window.setTimeout(async () => {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(q)}&limit=8`,
      );
      if (!response.ok) return;
      const data = (await response.json()) as { items: Suggestion[] };
      setResults(data.items);
      setActive(0);
    }, 180);
    return () => window.clearTimeout(handle);
  }, [term]);

  return (
    <div className={`search-box search-box-${size}`}>
      <search>
        <form action="/search" method="get">
          <label className="sr-only" htmlFor={`war-search-${size}`}>
            Search the repository
          </label>
          <SearchIcon className="search-box-icon" />
          <input
            id={`war-search-${size}`}
            ref={inputRef}
            name="q"
            type="search"
            defaultValue={defaultValue}
            autoComplete="off"
            placeholder="Search titles, creators, languages, tags…"
            aria-controls={listId}
            onChange={(event) => {
              setTerm(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 120)}
            onKeyDown={(event) => {
              if (!results.length) return;
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setActive((index) => (index + 1) % results.length);
              }
              if (event.key === 'ArrowUp') {
                event.preventDefault();
                setActive(
                  (index) => (index - 1 + results.length) % results.length,
                );
              }
              if (event.key === 'Enter' && open && results[active]) {
                event.preventDefault();
                router.push(`/title/${results[active].id}`);
              }
            }}
          />
          {size === 'hero' ? (
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          ) : null}
        </form>
      </search>
      {open && results.length > 0 ? (
        <ul id={listId} className="search-suggest">
          {results.map((item, index) => (
            <li key={item.id}>
              <Link
                href={`/title/${item.id}`}
                data-active={index === active}
                onMouseDown={(event) => event.preventDefault()}
              >
                <span className="suggest-title">{item.title}</span>
                <span className="suggest-meta">
                  {item.type} · {item.creators[0]}
                </span>
              </Link>
            </li>
          ))}
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
