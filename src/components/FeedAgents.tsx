'use client';

import { useEffect, useId, useState } from 'react';
import { buildAgentFeed } from '@/agent-feed/packet';
import { AGENT_INTENTS, type AgentIntent } from '@/agent-feed/types';
import type { CatalogEntry } from '@/catalog/types';
import { FeedIcon } from './Icons';

interface FeedAgentsProps {
  entry: CatalogEntry;
  displayedDescription: string;
}

type Status = { kind: 'ok' | 'err'; text: string } | null;

export function FeedAgents({ entry, displayedDescription }: FeedAgentsProps) {
  const formId = useId();
  const [open, setOpen] = useState(false);
  const [includeTitle, setIncludeTitle] = useState(true);
  const [excerpt, setExcerpt] = useState(displayedDescription);
  const [quote, setQuote] = useState('');
  const [userNote, setUserNote] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [url, setUrl] = useState('');
  const [intent, setIntent] = useState<AgentIntent>('distill');
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => {
    setExcerpt(displayedDescription);
  }, [displayedDescription]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setUrl(`${window.location.origin}/title/${entry.id}`);
  }, [entry.id]);

  useEffect(() => {
    fetch('/api/agent-feed')
      .then((response) => response.json())
      .then((data: { webhookEnabled?: boolean }) => {
        setWebhookEnabled(Boolean(data.webhookEnabled));
      })
      .catch(() => setWebhookEnabled(false));
  }, []);

  useEffect(() => {
    function syncHash() {
      if (window.location.hash === '#feed-agents') {
        setOpen(true);
      }
    }
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  function bundle() {
    return buildAgentFeed(entry, {
      includeTitle,
      excerpt: includeTitle ? excerpt : excerpt || undefined,
      quote,
      userNote,
      timestamp,
      url,
      intent,
    });
  }

  function openPanel() {
    const selected = window.getSelection()?.toString().trim();
    if (selected) {
      if (selected.length <= 280) setQuote(selected);
      else setExcerpt(selected);
    }
    setStatus(null);
    setOpen(true);
  }

  async function copyText(label: string, text: string) {
    await navigator.clipboard.writeText(text);
    setStatus({ kind: 'ok', text: `${label} copied.` });
  }

  function download(filename: string, text: string, type: string) {
    const blob = new Blob([text], { type });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(href);
    setStatus({ kind: 'ok', text: `${filename} downloaded.` });
  }

  async function sendWebhook() {
    setBusy(true);
    setStatus(null);
    try {
      const payload = bundle();
      const response = await fetch('/api/agent-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || 'Webhook failed');
      }
      setStatus({ kind: 'ok', text: 'Packet sent to the agent webhook.' });
    } catch (error) {
      setStatus({
        kind: 'err',
        text: error instanceof Error ? error.message : 'Send failed',
      });
    } finally {
      setBusy(false);
    }
  }

  const slug = entry.id;

  return (
    <section
      id="feed-agents"
      className="feed-agents"
      aria-labelledby={`${formId}-heading`}
    >
      <div className="feed-agents-intro">
        <div>
          <h2 id={`${formId}-heading`}>Feed agents</h2>
          <p>
            Package this title as a structured brief. Copy, download, or — if a
            webhook is configured — send it so an agent can distill it.
          </p>
        </div>
        {!open ? (
          <button type="button" className="btn btn-primary" onClick={openPanel}>
            <FeedIcon />
            Feed agents
          </button>
        ) : null}
      </div>

      {open ? (
        <form
          className="feed-agents-form"
          onSubmit={(event) => {
            event.preventDefault();
            const { markdown } = bundle();
            void copyText('Markdown brief', markdown);
          }}
        >
          <fieldset className="feed-intent">
            <legend>Intent</legend>
            {AGENT_INTENTS.map((value) => (
              <label key={value}>
                <input
                  type="radio"
                  name={`${formId}-intent`}
                  value={value}
                  checked={intent === value}
                  onChange={() => setIntent(value)}
                />
                {value}
              </label>
            ))}
          </fieldset>

          <label className="feed-check">
            <input
              type="checkbox"
              checked={includeTitle}
              onChange={(event) => setIncludeTitle(event.target.checked)}
            />
            Include the whole title card (description as selected text)
          </label>

          <div className="filter-field">
            <label htmlFor={`${formId}-excerpt`}>Description excerpt</label>
            <textarea
              id={`${formId}-excerpt`}
              rows={5}
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
            />
          </div>

          <div className="filter-field">
            <label htmlFor={`${formId}-quote`}>Quote (optional)</label>
            <textarea
              id={`${formId}-quote`}
              rows={2}
              value={quote}
              placeholder="A line you highlighted while listening"
              onChange={(event) => setQuote(event.target.value)}
            />
          </div>

          <div className="feed-row">
            <div className="filter-field">
              <label htmlFor={`${formId}-note`}>Your note</label>
              <input
                id={`${formId}-note`}
                type="text"
                value={userNote}
                placeholder="Why this matters to the agent"
                onChange={(event) => setUserNote(event.target.value)}
              />
            </div>
            <div className="filter-field">
              <label htmlFor={`${formId}-time`}>
                Timestamp / locus (optional)
              </label>
              <input
                id={`${formId}-time`}
                type="text"
                value={timestamp}
                placeholder="1:12:04 or chapter 3"
                onChange={(event) => setTimestamp(event.target.value)}
              />
            </div>
          </div>

          <div className="filter-field">
            <label htmlFor={`${formId}-url`}>URL</label>
            <input
              id={`${formId}-url`}
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
          </div>

          <div className="feed-actions">
            <button type="submit" className="btn btn-primary">
              Copy Markdown brief
            </button>
            <button
              type="button"
              className="btn"
              onClick={() =>
                void copyText(
                  'JSON packet',
                  JSON.stringify(bundle().packet, null, 2),
                )
              }
            >
              Copy JSON
            </button>
            <button
              type="button"
              className="btn"
              onClick={() =>
                download(
                  `${slug}.md`,
                  bundle().markdown,
                  'text/markdown;charset=utf-8',
                )
              }
            >
              Download Markdown
            </button>
            <button
              type="button"
              className="btn"
              onClick={() =>
                download(
                  `${slug}.json`,
                  JSON.stringify(bundle().packet, null, 2),
                  'application/json',
                )
              }
            >
              Download JSON
            </button>
            {webhookEnabled ? (
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy}
                onClick={() => void sendWebhook()}
              >
                {busy ? 'Sending…' : 'Send to webhook'}
              </button>
            ) : (
              <p className="translate-note">
                Webhook unset. Copy or download still works — set{' '}
                <code>AGENT_FEED_WEBHOOK_URL</code> to POST the packet.
              </p>
            )}
          </div>

          {status ? (
            <p
              className={`feed-status feed-status-${status.kind}`}
              role="status"
            >
              {status.text}
            </p>
          ) : null}
        </form>
      ) : null}
    </section>
  );
}
