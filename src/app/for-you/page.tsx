import type { Metadata } from 'next';
import Link from 'next/link';
import { loadForYouSnapshot, loadForYouTitles } from '@/catalog/for-you';
import { exploreRate } from '@/catalog/random';
import { loadUserSignals, topWeightedTopics } from '@/catalog/signals';
import { CatalogGrid } from '@/components/CatalogGrid';
import { YoutubeSignalForm } from '@/components/YoutubeSignalForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'For you',
  description:
    'Learned from your likes and YouTube signals — not a homepage scrape.',
};

export default function ForYouPage() {
  const signals = loadUserSignals();
  const snapshot = loadForYouSnapshot();
  const rate = exploreRate();
  const titles = loadForYouTitles(36);
  const topics = topWeightedTopics(signals, 12);
  const learnedAt = signals.learnedAt;
  const generatedAt = snapshot?.generatedAt ?? learnedAt;

  return (
    <div className="page-recommend">
      <header className="page-header">
        <p className="eyebrow">For you</p>
        <h1>Learned from your likes &amp; YouTube signals</h1>
        <p className="lede">
          Ranked from your likes and YouTube signals, then sampled with
          epsilon-greedy explore (rate {rate}, <code>FOR_YOU_RANDOMNESS</code>).
          Refresh for another related draw. It is{' '}
          <strong>not a youtube.com homepage scrape</strong> and not a world
          podcast directory. Google does not offer a supported API for that
          feed. Subscriptions and liked videos can join later through the
          YouTube Data API.
        </p>
        <p className="learned-meta">
          Last learned:{' '}
          <time dateTime={learnedAt ?? undefined}>
            {learnedAt
              ? formatStamp(learnedAt)
              : 'not yet — run ingest:for-you'}
          </time>
          {generatedAt ? (
            <>
              {' · '}
              Snapshot {formatStamp(generatedAt)}
            </>
          ) : null}
        </p>
        {topics.length > 0 ? (
          <ul className="learned-topics" aria-label="Learned topic weights">
            {topics.map((row) => (
              <li key={row.topic}>
                {row.topic}
                <span>{row.weight.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        ) : null}
        <YoutubeSignalForm />
        <p className="lede">
          <Link href="/recommendations">Because you like</Link>
          {' · '}
          <Link href="/explore">Explore</Link>
          {' · '}
          <code>npm run ingest:for-you</code>
        </p>
      </header>
      <CatalogGrid items={titles} />
    </div>
  );
}

function formatStamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().replace('T', ' ').slice(0, 16);
}
