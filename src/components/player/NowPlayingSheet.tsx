'use client';

import Link from 'next/link';
import { type PointerEvent, useEffect, useRef } from 'react';
import { generatedCoverPath } from '@/catalog/cover';
import { AskWar } from '@/components/AskWar';
import {
  ChevronDownIcon,
  CloseIcon,
  ExternalIcon,
  MuteIcon,
  PauseIcon,
  PlayIcon,
  QueueIcon,
  SkipBackIcon,
  SkipForwardIcon,
  VolumeIcon,
} from '@/components/Icons';
import { formatClock, formatPublished } from '@/player/format';
import { usePlayer } from '@/player/store';
import { PLAYBACK_RATES } from '@/player/types';
import { QueuePanel } from './QueuePanel';

const SWIPE_DISMISS_PX = 72;

export function NowPlayingSheet() {
  const open = usePlayer((state) => state.nowPlayingOpen);
  const queue = usePlayer((state) => state.queue);
  const status = usePlayer((state) => state.status);
  const currentTime = usePlayer((state) => state.currentTime);
  const duration = usePlayer((state) => state.duration);
  const rate = usePlayer((state) => state.rate);
  const muted = usePlayer((state) => state.muted);
  const error = usePlayer((state) => state.error);
  const sourceBlocked = usePlayer((state) => state.sourceBlocked);
  const queueOpen = usePlayer((state) => state.queueOpen);
  const toggle = usePlayer((state) => state.toggle);
  const skip = usePlayer((state) => state.skip);
  const seek = usePlayer((state) => state.seek);
  const setRate = usePlayer((state) => state.setRate);
  const setMuted = usePlayer((state) => state.setMuted);
  const next = usePlayer((state) => state.next);
  const previous = usePlayer((state) => state.previous);
  const toggleQueue = usePlayer((state) => state.toggleQueue);
  const closeNowPlaying = usePlayer((state) => state.closeNowPlaying);
  const item = usePlayer((state) => state.queue[state.index]);
  const dragStartY = useRef<number | null>(null);
  const pushedHistory = useRef(false);

  useEffect(() => {
    document.body.classList.toggle('now-playing-open', open);
    return () => document.body.classList.remove('now-playing-open');
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (pushedHistory.current) {
        pushedHistory.current = false;
        history.back();
        return;
      }
      closeNowPlaying();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, closeNowPlaying]);

  useEffect(() => {
    if (!open) return;

    history.pushState({ warNowPlaying: true }, '');
    pushedHistory.current = true;

    const onPop = () => {
      pushedHistory.current = false;
      closeNowPlaying();
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
    };
  }, [open, closeNowPlaying]);

  if (!open || !item) return null;

  const max = duration || item.durationSeconds || 0;
  const playing = status === 'playing' || status === 'loading';
  const published = formatPublished(item.publishedAt);
  const artwork = item.artwork || generatedCoverPath(item.showId);

  function dismiss() {
    if (pushedHistory.current) {
      pushedHistory.current = false;
      history.back();
      return;
    }
    closeNowPlaying();
  }

  function onHandlePointerDown(event: PointerEvent<HTMLDivElement>) {
    dragStartY.current = event.clientY;
  }

  function onHandlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = dragStartY.current;
    dragStartY.current = null;
    if (start != null && event.clientY - start >= SWIPE_DISMISS_PX) {
      dismiss();
    }
  }

  return (
    <div
      className="now-playing-sheet"
      role="dialog"
      aria-modal="true"
      aria-labelledby="now-playing-title"
    >
      <div
        className="now-playing-grab"
        onPointerDown={onHandlePointerDown}
        onPointerUp={onHandlePointerUp}
      >
        <span className="now-playing-handle" aria-hidden="true" />
        <header className="now-playing-header">
          <button
            type="button"
            className="icon-btn"
            aria-label="Close full player"
            onClick={dismiss}
          >
            <ChevronDownIcon />
          </button>
          <p>Now playing</p>
          <button
            type="button"
            className="icon-btn"
            aria-label="Close full player"
            onClick={dismiss}
          >
            <CloseIcon />
          </button>
        </header>
      </div>

      {item.kind === 'youtube' && item.youtubeId ? (
        <div className="now-playing-video">
          <iframe
            title={item.title}
            src={`https://www.youtube.com/embed/${item.youtubeId}?rel=0`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        // biome-ignore lint/performance/noImgElement: large now-playing artwork
        <img
          className="now-playing-art"
          src={artwork}
          alt=""
          width={600}
          height={600}
          onError={(event) => {
            const fallback = generatedCoverPath(item.showId);
            if (event.currentTarget.src !== fallback) {
              event.currentTarget.src = fallback;
            }
          }}
        />
      )}

      <div className="now-playing-copy">
        <p className="now-playing-show">
          <Link
            href={`/title/${encodeURIComponent(item.showId)}`}
            onClick={dismiss}
          >
            {item.showTitle}
          </Link>
        </p>
        <h2 id="now-playing-title">{item.title}</h2>
        <p className="now-playing-meta">
          {[
            published,
            item.durationSeconds
              ? formatClock(item.durationSeconds)
              : undefined,
            item.kind === 'youtube' ? 'YouTube' : 'Audio stream',
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>

      {sourceBlocked || error ? (
        <div className="now-playing-error">
          <p>
            {error ??
              'This enclosure could not be streamed here (blocked or missing).'}
          </p>
          {item.sourceUrl ? (
            <a
              className="btn btn-primary"
              href={item.sourceUrl}
              rel="noreferrer noopener"
              target="_blank"
            >
              <ExternalIcon />
              Open in source
            </a>
          ) : null}
        </div>
      ) : null}

      <div className="now-playing-seek">
        <span>{formatClock(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={Math.max(1, max)}
          step={1}
          value={Math.min(currentTime, max || currentTime)}
          aria-label="Seek"
          onChange={(event) => seek(Number(event.target.value))}
        />
        <span>-{formatClock(Math.max(0, max - currentTime))}</span>
      </div>

      <div className="now-playing-controls">
        <button
          type="button"
          className="icon-btn"
          aria-label="Previous"
          onClick={previous}
        >
          <SkipBackIcon />
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label="Skip back 15 seconds"
          onClick={() => skip(-15)}
        >
          <span className="skip-label">15</span>
        </button>
        <button
          type="button"
          className="icon-btn icon-btn-play now-playing-play"
          aria-label={playing ? 'Pause' : 'Play'}
          onClick={toggle}
        >
          {playing ? <PauseIcon size={28} /> : <PlayIcon size={28} />}
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label="Skip forward 30 seconds"
          onClick={() => skip(30)}
        >
          <span className="skip-label">30</span>
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label="Next"
          onClick={next}
          disabled={queue.length < 2}
        >
          <SkipForwardIcon />
        </button>
      </div>

      <div className="now-playing-extras">
        <label className="sr-only" htmlFor="now-playing-rate">
          Playback speed
        </label>
        <select
          id="now-playing-rate"
          value={rate}
          onChange={(event) =>
            setRate(Number(event.target.value) as typeof rate)
          }
        >
          {PLAYBACK_RATES.map((value) => (
            <option key={value} value={value}>
              {value}×
            </option>
          ))}
        </select>
        <button
          type="button"
          className="icon-btn"
          aria-label={muted ? 'Unmute' : 'Mute'}
          onClick={() => setMuted(!muted)}
        >
          {muted ? <MuteIcon /> : <VolumeIcon />}
        </button>
        <button
          type="button"
          className={`icon-btn${queueOpen ? ' is-active' : ''}`}
          aria-label="Queue"
          aria-pressed={queueOpen}
          onClick={toggleQueue}
        >
          <QueueIcon />
          <span className="queue-count">{queue.length}</span>
        </button>
      </div>

      <QueuePanel />

      <AskWar episode={item} timestamp={formatClock(currentTime)} expanded />

      {item.description ? (
        <div className="now-playing-notes">
          <h3>Episode notes</h3>
          <p>{item.description}</p>
        </div>
      ) : (
        <p className="now-playing-notes-empty">
          Streamed from the publisher feed. We keep metadata and the enclosure
          URL only — never the audio file.
        </p>
      )}

      {item.sourceUrl ? (
        <p className="now-playing-source">
          <a href={item.sourceUrl} rel="noreferrer noopener" target="_blank">
            <ExternalIcon />
            Open episode source
          </a>
        </p>
      ) : null}
    </div>
  );
}
