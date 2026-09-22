'use client';

import {
  ExternalIcon,
  MuteIcon,
  PauseIcon,
  PlayIcon,
  QueueIcon,
  SkipBackIcon,
  SkipForwardIcon,
  VolumeIcon,
} from '@/components/Icons';
import { formatClock } from '@/player/format';
import { usePlayer } from '@/player/store';
import { PLAYBACK_RATES } from '@/player/types';
import { QueuePanel } from './QueuePanel';

export function MiniPlayer() {
  const ready = usePlayer((state) => state.ready);
  const queue = usePlayer((state) => state.queue);
  const status = usePlayer((state) => state.status);
  const currentTime = usePlayer((state) => state.currentTime);
  const duration = usePlayer((state) => state.duration);
  const rate = usePlayer((state) => state.rate);
  const muted = usePlayer((state) => state.muted);
  const error = usePlayer((state) => state.error);
  const sourceBlocked = usePlayer((state) => state.sourceBlocked);
  const toggle = usePlayer((state) => state.toggle);
  const skip = usePlayer((state) => state.skip);
  const seek = usePlayer((state) => state.seek);
  const setRate = usePlayer((state) => state.setRate);
  const setMuted = usePlayer((state) => state.setMuted);
  const next = usePlayer((state) => state.next);
  const previous = usePlayer((state) => state.previous);
  const toggleQueue = usePlayer((state) => state.toggleQueue);
  const queueOpen = usePlayer((state) => state.queueOpen);
  const item = usePlayer((state) => state.queue[state.index]);

  if (!ready || !queue.length || !item) return null;

  const max = duration || item.durationSeconds || 0;
  const playing = status === 'playing' || status === 'loading';

  return (
    <section className="mini-player" aria-label="Now playing">
      {item.kind === 'youtube' && item.youtubeId ? (
        <div className="mini-player-video">
          <iframe
            title={item.title}
            src={`https://www.youtube.com/embed/${item.youtubeId}?rel=0`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : null}
      <QueuePanel />
      {sourceBlocked || error ? (
        <div className="mini-player-error">
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
      <div className="mini-player-bar">
        <div className="mini-player-meta">
          {item.artwork ? (
            // biome-ignore lint/performance/noImgElement: small now-playing artwork
            <img src={item.artwork} alt="" width={48} height={48} />
          ) : (
            <span className="mini-player-mark" aria-hidden="true">
              WAR
            </span>
          )}
          <div>
            <p className="mini-player-title">{item.title}</p>
            <p className="mini-player-show">{item.showTitle}</p>
          </div>
        </div>
        <div className="mini-player-controls">
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
            className="icon-btn icon-btn-play"
            aria-label={playing ? 'Pause' : 'Play'}
            onClick={toggle}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
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
        <div className="mini-player-seek">
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
        <div className="mini-player-extras">
          <label className="sr-only" htmlFor="playback-rate">
            Playback speed
          </label>
          <select
            id="playback-rate"
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
      </div>
    </section>
  );
}
