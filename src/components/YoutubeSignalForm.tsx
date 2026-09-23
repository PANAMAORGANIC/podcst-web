'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';

export function YoutubeSignalForm() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = url.trim();
    if (!next) return;
    setBusy(true);
    setStatus(null);
    try {
      const response = await fetch('/api/for-you', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: next }),
      });
      const body = (await response.json()) as {
        error?: string;
        parsed?: { kind?: string };
      };
      if (!response.ok) {
        setStatus(body.error ?? 'Could not save that URL.');
        return;
      }
      setUrl('');
      setStatus(
        `Saved as a strong ${body.parsed?.kind ?? 'YouTube'} signal. For You will re-rank from learned weights.`,
      );
      router.refresh();
    } catch {
      setStatus('Network error. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="signal-form" onSubmit={onSubmit}>
      <label className="signal-form-label" htmlFor="youtube-signal-url">
        Add a YouTube channel or video URL
      </label>
      <div className="signal-form-row">
        <input
          id="youtube-signal-url"
          name="url"
          type="url"
          inputMode="url"
          autoComplete="url"
          placeholder="https://www.youtube.com/@channel or /watch?v="
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          disabled={busy}
        />
        <button type="submit" disabled={busy || !url.trim()}>
          {busy ? 'Saving…' : 'Add signal'}
        </button>
      </div>
      <p className="signal-form-hint">
        This is a positive signal we store. We do not scrape the YouTube
        homepage or its recommendation feed.
      </p>
      {status ? (
        <p className="signal-form-status" role="status">
          {status}
        </p>
      ) : null}
    </form>
  );
}
