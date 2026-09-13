import type { Metadata } from 'next';
import Link from 'next/link';
import { exploreNeighborhoodTitles } from '@/catalog/for-you';
import { exploreRate } from '@/catalog/random';
import { loadUserSignals, topWeightedTopics } from '@/catalog/signals';
import { CatalogGrid } from '@/components/CatalogGrid';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Explore',
  description:
    'Stochastic finds inside your learned topic neighborhood — not a world directory.',
};

export default function ExplorePage() {
  const rate = Math.max(exploreRate(), 0.25);
  const topics = topWeightedTopics(loadUserSignals(), 8);
  const titles = exploreNeighborhoodTitles(24, { exploreRate: rate });

  return (
    <div className="page-recommend">
      <header className="page-header">
        <p className="eyebrow">Explore</p>
        <h1>Related, not random junk</h1>
        <p className="lede">
          Epsilon-greedy sampling over shows already close to your likes and
          learned topics (climate, ecology, seeds, science interviews, energy).
          Explore rate {rate}. Refresh for another draw from the same
          neighborhood — not Hausa charts or public-domain shelves unless they
          sit on your graph.
        </p>
        {topics.length > 0 ? (
          <ul className="learned-topics" aria-label="Neighborhood topics">
            {topics.map((row) => (
              <li key={row.topic}>
                {row.topic}
                <span>{row.weight.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        ) : null}
        <p className="lede">
          <Link href="/for-you">For you</Link>
          {' · '}
          <Link href="/recommendations">Because you like</Link>
          {' · '}
          <code>FOR_YOU_RANDOMNESS</code>
        </p>
      </header>
      <CatalogGrid items={titles} />
    </div>
  );
}
