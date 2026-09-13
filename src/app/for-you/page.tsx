import type { Metadata } from 'next';
import Link from 'next/link';
import { loadForYouSnapshot, loadForYouTitles } from '@/catalog/for-you';
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
          This mix is ranked from the live catalogue using topic weights that
          update as you like shows and add YouTube channels. It is{' '}
          <strong>not a youtube.com homepage scrape</strong> — Google does not
          offer a supported API for that feed, and scraping it is out of scope.
          Subscriptions and liked videos can join later through the YouTube Data
          API (API key for public search; OAuth for private lists).
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
          <Link href="/recommendations">Because you like (seed rails)</Link>
          {' · '}
          <Link href="/about#ingest">How ingest works</Link>
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
