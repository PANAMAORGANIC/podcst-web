'use client';

import { useEffect } from 'react';
import { create } from 'zustand';
import { LIKED_STORAGE_KEY } from '@/catalog/like-constants';

type LikesState = {
  ready: boolean;
  ids: string[];
  hydrate: (seeds: string[]) => void;
  toggle: (id: string) => void;
};

function readStored(): string[] | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(LIKED_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((id): id is string => typeof id === 'string');
  } catch {
    return null;
  }
}

function persist(ids: string[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(ids));
}

async function syncServer(id: string, liked: boolean) {
  try {
    await fetch('/api/likes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, liked }),
    });
  } catch {
    // localStorage still holds the like for this browser
  }
}

export const useLikes = create<LikesState>((set, get) => ({
  ready: false,
  ids: [],
  hydrate: (seeds) => {
    if (get().ready) return;
    const stored = readStored();
    if (stored) {
      set({ ready: true, ids: stored });
      return;
    }
    set({ ready: true, ids: seeds });
    persist(seeds);
    void fetch('/api/likes')
      .then((response) => response.json())
      .then((data: { seeds?: string[]; liked?: string[] }) => {
        if (get().ids.length > seeds.length) return;
        const merged = unique([
          ...(data.seeds ?? seeds),
          ...(data.liked ?? []),
        ]);
        if (!readStored() || readStored()?.length === seeds.length) {
          set({ ids: merged });
          persist(merged);
        }
      })
      .catch(() => undefined);
  },
  toggle: (id) => {
    const liked = get().ids.includes(id);
    const ids = liked
      ? get().ids.filter((item) => item !== id)
      : [...get().ids, id];
    set({ ids });
    persist(ids);
    void syncServer(id, !liked);
  },
}));

export function useHydrateLikes(seeds: string[]) {
  const hydrate = useLikes((state) => state.hydrate);
  const key = seeds.join('|');
  useEffect(() => {
    hydrate(key ? key.split('|') : []);
  }, [hydrate, key]);
}

function unique(ids: string[]): string[] {
  return [...new Set(ids.filter(Boolean))];
}
