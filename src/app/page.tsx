import Link from 'next/link';
import { forYouRail } from '@/catalog/for-you';
import { listFavoriteSeedIds, listSeedEntries } from '@/catalog/likes';
import { homeRails } from '@/catalog/rails';
import { recommendRails } from '@/catalog/recommend';
import { catalogStats, getCatalog } from '@/catalog/store';
import { BecauseYouLikeRails } from '@/components/BecauseYouLike';
import { CatalogRail } from '@/components/CatalogRail';
import { SearchBox } from '@/components/SearchBox';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const stats = catalogStats();
  const rails = homeRails();
  const seedIds = listFavoriteSeedIds();
  const likedRails = recommendRails(listSeedEntries(), getCatalog(), 8);

  return (
    <div className="page-home">
      <section className="hero">
        <p className="eyebrow">A catalogue, not a player</p>
        <h1>The world’s spoken record, in one repository.</h1>
        <p className="lede">
          Podcasts, audiobooks, and long-form YouTube — weighted for languages,
          regions, and niches that charts usually hide. Open the source. We keep
          the card.
        </p>
        <SearchBox size="hero" />
        <ul className="hero-stats">
          <li>
            <strong>{stats.titles}</strong> titles
          </li>
          <li>
            <strong>{stats.languages}</strong> languages
          </li>
          <li>
            <strong>{stats.regions}</strong> regions
          </li>
        </ul>
      </section>
      <section className="type-doors" aria-label="Browse by type">
        <TypeDoor
          href="/podcasts"
          kicker="01"
          title="Podcasts"
          copy="Feeds and public desks from Hausa radio to Catalan mornings."
          count={stats.types.podcast}
        />
        <TypeDoor
          href="/audiobooks"
          kicker="02"
          title="Audiobooks"
          copy="Public-domain recitations plus copyrighted titles as metadata only."
          count={stats.types.audiobook}
        />
        <TypeDoor
          href="/youtube"
          kicker="03"
          title="YouTube"
          copy="Lectures, correspondents, and channels that still take an hour."
          count={stats.types.youtube}
        />
      </section>
      <CatalogRail rail={forYouRail(8)} />
      <p className="recommend-more">
        <Link href="/for-you">Open For you</Link>
        {' · '}
        <Link href="/recommendations">Because you like</Link>
      </p>
      <BecauseYouLikeRails
        seedIds={seedIds}
        initialRails={likedRails}
        heading="Because you like these shows"
      />
      {rails.map((rail) => (
        <CatalogRail key={rail.id} rail={rail} />
      ))}
    </div>
  );
}

function TypeDoor({
  href,
  kicker,
  title,
  copy,
  count,
}: {
  href: string;
  kicker: string;
  title: string;
  copy: string;
  count: number;
}) {
  return (
    <Link href={href} className="type-door">
      <span className="type-door-kicker">{kicker}</span>
      <h2>{title}</h2>
      <p>{copy}</p>
      <span className="type-door-count">{count} in the demo slice</span>
    </Link>
  );
}
