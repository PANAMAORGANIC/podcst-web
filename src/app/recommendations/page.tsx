import type { Metadata } from 'next';
import Link from 'next/link';
import { listFavoriteSeedIds, listSeedEntries } from '@/catalog/likes';
import { recommendRails } from '@/catalog/recommend';
import { getCatalog } from '@/catalog/store';
import { BecauseYouLikeRails } from '@/components/BecauseYouLike';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Recommendations',
  description:
    'Shows related to what you like, ranked from the live catalog — same language and hub peers first.',
};

export default function RecommendationsPage() {
  const seeds = listSeedEntries();
  const seedIds = listFavoriteSeedIds();
  const rails = recommendRails(seeds, getCatalog(), 8);

  return (
    <div className="page-recommend">
      <header className="page-header">
        <p className="eyebrow">Because you like</p>
        <h1>Recommendations from the catalogue</h1>
        <p className="lede">
          Seeds start as the owner favorites (Radio Semilla, EcoJustice Radio,
          632nm, Tangentially Speaking, Planet: Critical, The Great
          Simplification). Like more titles to widen the rails. Related cards
          come from Podcast Index and Apple ingest — not Castbox. Ranking keeps
          the seed’s language first so a Spanish like does not collapse to a US
          chart.
        </p>
        <p className="lede">
          <Link href="/about#ingest">How ingest works</Link>
          {' · '}
          <code>npm run ingest:recommend</code>
        </p>
      </header>
      <BecauseYouLikeRails
        seedIds={seedIds}
        initialRails={rails}
        heading="From shows you like"
      />
    </div>
  );
}
