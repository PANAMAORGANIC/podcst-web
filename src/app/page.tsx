import type { Metadata } from 'next';
import Link from 'next/link';
import { loadCachedHome } from '@/catalog/home';
import { BecauseYouLikeRails } from '@/components/BecauseYouLike';
import { CatalogRail } from '@/components/CatalogRail';
import { LibraryRail } from '@/components/LibraryRail';
import { SearchBox } from '@/components/SearchBox';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Library',
  description:
    'Your library — For You and related finds from likes and YouTube signals.',
};

export default function HomePage() {
  const { seedIds, likedRails, rate, rails } = loadCachedHome();
  const forYou = rails.find((rail) => rail.id === 'for-you');
  const rest = rails.filter((rail) => rail.id !== 'for-you');

  return (
    <div className="page-home">
      <section className="hero">
        <p className="eyebrow">Library</p>
        <h1>Your library — For You lives here.</h1>
        <p className="lede">
          For You and Because you like are learned from your favorites, likes,
          and YouTube signals. Subscribed shows live on Shelf. The large
          catalogue stays a backend pool for related search. Explore rate {rate}{' '}
          keeps the mix from going stale.
        </p>
        <SearchBox size="hero" />
        <p className="recommend-more">
          <Link href="/shelf">Shelf</Link>
          {' · '}
          <Link href="/recommendations">Because you like</Link>
          {' · '}
          <Link href="/explore">Explore</Link>
        </p>
      </section>
      {forYou ? (
        <CatalogRail rail={forYou} moreHref="/for-you" moreLabel="See all" />
      ) : null}
      <LibraryRail />
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
