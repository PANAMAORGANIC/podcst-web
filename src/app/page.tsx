import Link from 'next/link';
import { listFavoriteSeedIds, listSeedEntries } from '@/catalog/likes';
import { homeRails } from '@/catalog/rails';
import { exploreRate } from '@/catalog/random';
import { recommendRails } from '@/catalog/recommend';
import { getCatalog } from '@/catalog/store';
import { BecauseYouLikeRails } from '@/components/BecauseYouLike';
import { CatalogRail } from '@/components/CatalogRail';
import { SearchBox } from '@/components/SearchBox';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const seedIds = listFavoriteSeedIds();
  const likedRails = recommendRails(listSeedEntries(), getCatalog(), 8);
  const rate = exploreRate();
  const rails = homeRails();
  const forYou = rails.find((rail) => rail.id === 'for-you');
  const rest = rails.filter((rail) => rail.id !== 'for-you');

  return (
    <div className="page-home">
      <section className="hero">
        <p className="eyebrow">Curated for RED</p>
        <h1>Your shelf — plus surprising-but-related finds.</h1>
        <p className="lede">
          For You and Because you like are learned from your favorites, likes,
          and YouTube signals. The large catalogue stays a backend pool for
          related search. Explore rate {rate} keeps the mix from going stale.
        </p>
        <SearchBox size="hero" />
        <p className="recommend-more">
          <Link href="/for-you">For you</Link>
          {' · '}
          <Link href="/recommendations">Because you like</Link>
          {' · '}
          <Link href="/explore">Explore</Link>
        </p>
      </section>
      {forYou ? <CatalogRail rail={forYou} /> : null}
      <BecauseYouLikeRails
        seedIds={seedIds}
        initialRails={likedRails}
        heading="Because you like these shows"
      />
      {rest.map((rail) => (
        <CatalogRail key={rail.id} rail={rail} />
      ))}
    </div>
  );
}
