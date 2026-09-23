'use client';

import { create } from 'zustand';
import { progressState } from './format';
import { emptyPersisted, readPersisted, writePersisted } from './persist';
import { clampIndex, enqueueItem, moveItem, removeItem } from './queue';
import {
  type PersistedPlayer,
  PLAYBACK_RATES,
  type Playable,
  type PlaybackRate,
} from './types';

type PlayerStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

type PlayerState = {
  ready: boolean;
  queue: Playable[];
  index: number;
  status: PlayerStatus;
  currentTime: number;
  duration: number;
  rate: PlaybackRate;
  muted: boolean;
  volume: number;
  error: string | null;
  sourceBlocked: boolean;
  queueOpen: boolean;
  nowPlayingOpen: boolean;
  progress: PersistedPlayer['progress'];
  hydrate: () => void;
  playItem: (item: Playable, extras?: { queue?: Playable[] }) => void;
  playIndex: (index: number) => void;
  toggle: () => void;
  pause: () => void;
  resume: () => void;
  seek: (seconds: number) => void;
  skip: (delta: number) => void;
  setRate: (rate: PlaybackRate) => void;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
  next: () => void;
  previous: () => void;
  enqueue: (item: Playable) => void;
  remove: (id: string) => void;
  move: (from: number, to: number) => void;
  clear: () => void;
  toggleQueue: () => void;
  openNowPlaying: () => void;
  closeNowPlaying: () => void;
  toggleNowPlaying: () => void;
  reportTime: (currentTime: number, duration: number) => void;
  reportReady: (duration: number) => void;
  reportEnded: () => void;
  reportError: (message: string, sourceBlocked?: boolean) => void;
  seekRequest: number | null;
  consumeSeek: () => void;
};

function persistSlice(state: PlayerState) {
  writePersisted({
    version: 1,
    queue: state.queue,
    index: state.index,
    rate: state.rate,
    muted: state.muted,
    volume: state.volume,
    progress: state.progress,
  });
}

export const usePlayer = create<PlayerState>((set, get) => ({
  ready: false,
  queue: [],
  index: 0,
  status: 'idle',
  currentTime: 0,
  duration: 0,
  rate: 1,
  muted: false,
  volume: 1,
  error: null,
  sourceBlocked: false,
  queueOpen: false,
  nowPlayingOpen: false,
  progress: {},
  seekRequest: null,
  hydrate: () => {
    if (get().ready) return;
    const saved =
      typeof window === 'undefined' ? emptyPersisted() : readPersisted();
    const current = saved.queue[saved.index];
    const head = current ? saved.progress[current.id] : undefined;
    set({
      ready: true,
      queue: saved.queue,
      index: saved.index,
      rate: saved.rate,
      muted: saved.muted,
      volume: saved.volume,
      progress: saved.progress,
      currentTime: head?.currentTime ?? 0,
      duration: head?.duration ?? current?.durationSeconds ?? 0,
      status: saved.queue.length ? 'paused' : 'idle',
    });
  },
  playItem: (item, extras) => {
    const incoming = extras?.queue?.length ? extras.queue : [item];
    const found = incoming.findIndex((row) => row.id === item.id);
    const queue = found >= 0 ? incoming : enqueueItem(incoming, item);
    const index = found >= 0 ? found : queue.length - 1;
    const head = get().progress[item.id];
    set({
      queue,
      index,
      status: 'loading',
      error: null,
      sourceBlocked: false,
      currentTime: head?.currentTime ?? 0,
      duration: head?.duration ?? item.durationSeconds ?? 0,
      seekRequest:
        head && progressState(head.currentTime, head.duration) === 'in-progress'
          ? head.currentTime
          : null,
    });
    persistSlice(get());
  },
  playIndex: (index) => {
    const item = get().queue[index];
    if (!item) return;
    get().playItem(item, { queue: get().queue });
  },
  toggle: () => {
    const { status, queue } = get();
    if (!queue.length) return;
    if (status === 'playing') {
      set({ status: 'paused' });
      return;
    }
    set({ status: 'playing', error: null, sourceBlocked: false });
  },
  pause: () => set({ status: 'paused' }),
  resume: () => {
    if (!get().queue.length) return;
    set({ status: 'playing', error: null, sourceBlocked: false });
  },
  seek: (seconds) => {
    const duration = get().duration;
    const next = Math.max(
      0,
      duration ? Math.min(seconds, duration) : Math.max(0, seconds),
    );
    set({ currentTime: next, seekRequest: next });
  },
  skip: (delta) => {
    get().seek(get().currentTime + delta);
  },
  setRate: (rate) => {
    if (!PLAYBACK_RATES.includes(rate)) return;
    set({ rate });
    persistSlice(get());
  },
  setMuted: (muted) => {
    set({ muted });
    persistSlice(get());
  },
  setVolume: (volume) => {
    const next = Math.min(1, Math.max(0, volume));
    set({ volume: next, muted: next === 0 });
    persistSlice(get());
  },
  next: () => {
    const { index, queue } = get();
    if (index + 1 < queue.length) get().playIndex(index + 1);
    else set({ status: 'paused' });
  },
  previous: () => {
    const { index, currentTime } = get();
    if (currentTime > 3) {
      get().seek(0);
      return;
    }
    if (index > 0) get().playIndex(index - 1);
    else get().seek(0);
  },
  enqueue: (item) => {
    const queue = enqueueItem(get().queue, item);
    set({ queue });
    persistSlice(get());
  },
  remove: (id) => {
    const { queue, index } = get();
    const at = queue.findIndex((row) => row.id === id);
    if (at < 0) return;
    const next = removeItem(queue, id);
    const nextIndex = clampIndex(at < index ? index - 1 : index, next.length);
    set({
      queue: next,
      index: nextIndex,
      status: next.length ? get().status : 'idle',
      currentTime: next.length ? get().currentTime : 0,
      nowPlayingOpen: next.length ? get().nowPlayingOpen : false,
      queueOpen: next.length ? get().queueOpen : false,
    });
    persistSlice(get());
  },
  move: (from, to) => {
    const queue = moveItem(get().queue, from, to);
    const currentId = get().queue[get().index]?.id;
    const index = currentId
      ? Math.max(
          0,
          queue.findIndex((row) => row.id === currentId),
        )
      : 0;
    set({ queue, index });
    persistSlice(get());
  },
  clear: () => {
    set({
      queue: [],
      index: 0,
      status: 'idle',
      currentTime: 0,
      duration: 0,
      error: null,
      sourceBlocked: false,
      nowPlayingOpen: false,
      queueOpen: false,
    });
    persistSlice(get());
  },
  toggleQueue: () => set({ queueOpen: !get().queueOpen }),
  openNowPlaying: () => {
    if (!get().queue.length) return;
    set({ nowPlayingOpen: true });
  },
  closeNowPlaying: () => set({ nowPlayingOpen: false }),
  toggleNowPlaying: () => {
    if (!get().queue.length) return;
    set({ nowPlayingOpen: !get().nowPlayingOpen });
  },
  reportTime: (currentTime, duration) => {
    const item = get().queue[get().index];
    set({ currentTime, duration: duration || get().duration });
    if (!item) return;
    const progress = {
      ...get().progress,
      [item.id]: {
        currentTime,
        duration: duration || get().duration || item.durationSeconds || 0,
        updatedAt: Date.now(),
      },
    };
    set({ progress });
    persistSlice(get());
  },
  reportReady: (duration) => {
    const item = get().queue[get().index];
    const saved = item ? get().progress[item.id] : undefined;
    set({
      duration,
      status: get().status === 'paused' ? 'paused' : 'playing',
      error: null,
      sourceBlocked: false,
    });
    if (
      saved &&
      progressState(saved.currentTime, saved.duration) === 'in-progress'
    ) {
      set({ seekRequest: saved.currentTime, currentTime: saved.currentTime });
    }
  },
  reportEnded: () => {
    const item = get().queue[get().index];
    if (item) {
      set({
        progress: {
          ...get().progress,
          [item.id]: {
            currentTime: get().duration || item.durationSeconds || 0,
            duration: get().duration || item.durationSeconds || 0,
            updatedAt: Date.now(),
          },
        },
      });
      persistSlice(get());
    }
    get().next();
  },
  reportError: (message, sourceBlocked = true) => {
    set({
      status: 'error',
      error: message,
      sourceBlocked,
    });
  },
  consumeSeek: () => set({ seekRequest: null }),
}));

export function currentPlayable(state: PlayerState = usePlayer.getState()) {
  return state.queue[state.index];
}
