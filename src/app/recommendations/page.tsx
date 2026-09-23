import type { Metadata } from 'next';
import Link from 'next/link';
import { listFavoriteSeedIds, listSeedEntries } from '@/catalog/likes';
import { recommendRails } from '@/catalog/recommend';
import { getShelfCatalog } from '@/catalog/store';
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
  const rails = recommendRails(seeds, getShelfCatalog(), 8);

  return (
    <div className="page-recommend">
      <header className="page-header">
        <p className="eyebrow">Because you like</p>
        <h1>Related to shows you already like</h1>
        <p className="lede">
          Seeds start as the owner favorites (Radio Semilla, EcoJustice Radio,
          632nm, Tangentially Speaking, Planet: Critical, The Great
          Simplification). Each rail samples related neighbours with an explore
          rate so the order is not fully deterministic. Spanish seeds stay
          Spanish-first. Not a genre directory.
        </p>
        <p className="lede">
          The learned mix lives in your <Link href="/">library</Link>
          {' · '}
          <Link href="/explore">Explore</Link> walks the same neighborhood with
          a higher explore rate.
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
