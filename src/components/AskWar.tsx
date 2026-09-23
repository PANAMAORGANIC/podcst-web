'use client';

import { useEffect, useId, useRef, useState } from 'react';
import {
  buildAskWarFeed,
  grokBotSidebarUrl,
  stubEntryFromEpisode,
} from '@/agent-feed/packet';
import { WAR_GROK_AGENT_ID, WAR_GROK_AGENT_NAME } from '@/agent-feed/types';
import type { CatalogEntry } from '@/catalog/types';
import type { Playable } from '@/player/types';
import { FeedIcon, MicIcon } from './Icons';

type SpeechCtor = new () => {
  lang: string;
  interimResults: boolean;
  onresult:
    | ((event: {
        results: ArrayLike<ArrayLike<{ transcript: string }>>;
      }) => void)
    | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function speechCtor(): SpeechCtor | undefined {
  if (typeof window === 'undefined') return undefined;
  const extra = window as unknown as {
    SpeechRecognition?: SpeechCtor;
    webkitSpeechRecognition?: SpeechCtor;
  };
  return extra.SpeechRecognition || extra.webkitSpeechRecognition;
}

export function AskWar({
  episode,
  entry,
  timestamp,
  catalogOrigin,
  expanded = false,
}: {
  episode: Playable;
  entry?: CatalogEntry;
  timestamp?: string;
  catalogOrigin?: string;
  expanded?: boolean;
}) {
  const formId = useId();
  const [open, setOpen] = useState(expanded);
  const [question, setQuestion] = useState('');
  const [listening, setListening] = useState(false);
  const [canHear, setCanHear] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const recognition = useRef<InstanceType<SpeechCtor> | null>(null);

  useEffect(() => {
    setCanHear(Boolean(speechCtor()));
  }, []);

  useEffect(() => {
    return () => recognition.current?.stop();
  }, []);

  function bundle() {
    const show = entry ?? stubEntryFromEpisode(episode);
    const origin =
      catalogOrigin ||
      (typeof window !== 'undefined' ? window.location.origin : '');
    return buildAskWarFeed(show, episode, {
      question,
      timestamp,
      url: origin
        ? `${origin}/title/${encodeURIComponent(show.id)}`
        : undefined,
    });
  }

  async function copyPacket() {
    const { markdown } = bundle();
    try {
      await navigator.clipboard.writeText(markdown);
      return true;
    } catch {
      return false;
    }
  }

  function openGrokBot() {
    const href = grokBotSidebarUrl(WAR_GROK_AGENT_ID);
    const link = document.createElement('a');
    link.href = href;
    link.rel = 'noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async function ask() {
    const copied = await copyPacket();
    openGrokBot();
    setStatus(
      copied
        ? `Packet copied. Opening ${WAR_GROK_AGENT_NAME} in Grok Bot (agent ${WAR_GROK_AGENT_ID}). If chat does not open, paste the packet there and ask.`
        : `Could not copy automatically. Open Grok Bot agent ${WAR_GROK_AGENT_ID} and paste the Ask WAR brief.`,
    );
  }

  function toggleListen() {
    const Ctor = speechCtor();
    if (!Ctor) {
      setStatus('This browser has no speech recognition. Type the question.');
      return;
    }
    if (listening) {
      recognition.current?.stop();
      setListening(false);
      return;
    }
    const rec = new Ctor();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.onresult = (event) => {
      const bit = event.results[0]?.[0]?.transcript?.trim();
      if (bit) {
        setQuestion((prev) => (prev ? `${prev.trim()} ${bit}` : bit));
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognition.current = rec;
    rec.start();
    setListening(true);
    setStatus('Listening… speak, then Ask WAR. Audio stays on this device.');
  }

  return (
    <section
      className={`ask-war${open ? ' is-open' : ''}`}
      aria-label="Ask WAR"
    >
      {!open ? (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setOpen(true);
            setStatus(null);
          }}
        >
          <FeedIcon />
          Ask WAR
        </button>
      ) : (
        <form
          className="ask-war-form"
          onSubmit={(event) => {
            event.preventDefault();
            void ask();
          }}
        >
          <header className="ask-war-head">
            <div>
              <h3>Ask WAR</h3>
              <p>
                Talk to the WAR agent ({WAR_GROK_AGENT_ID}) about this episode —
                themes, authors, books, terms. Packet is metadata and source
                links only.
              </p>
            </div>
            {expanded ? null : (
              <button
                type="button"
                className="btn"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            )}
          </header>
          <label className="sr-only" htmlFor={formId}>
            Question for WAR
          </label>
          <div className="ask-war-input">
            <textarea
              id={formId}
              rows={3}
              value={question}
              placeholder="What should WAR look up? (optional)"
              onChange={(event) => setQuestion(event.target.value)}
            />
            {canHear ? (
              <button
                type="button"
                className={`icon-btn${listening ? ' is-active' : ''}`}
                aria-pressed={listening}
                aria-label={listening ? 'Stop listening' : 'Speak a question'}
                onClick={toggleListen}
              >
                <MicIcon />
              </button>
            ) : null}
          </div>
          <div className="ask-war-actions">
            <button type="submit" className="btn btn-primary">
              <FeedIcon />
              Ask WAR
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                void copyPacket().then((ok) => {
                  setStatus(
                    ok
                      ? 'Packet copied. Paste it into the WAR agent if Grok Bot is already open.'
                      : 'Copy failed.',
                  );
                });
              }}
            >
              Copy packet
            </button>
            <a className="btn" href={grokBotSidebarUrl(WAR_GROK_AGENT_ID)}>
              Open agent {WAR_GROK_AGENT_ID}
            </a>
          </div>
          {status ? (
            <p className="ask-war-status" role="status">
              {status}
            </p>
          ) : (
            <p className="ask-war-hint">
              Type or speak a question, then Ask WAR. We copy the brief and open{' '}
              <code>grokbot://app/v1/sidebar?agent={WAR_GROK_AGENT_ID}</code>.
              If that cannot land in chat, paste the packet and ask.
            </p>
          )}
        </form>
      )}
    </section>
  );
}
