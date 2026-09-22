import type { Metadata } from 'next';
import Link from 'next/link';
import { catalogStats } from '@/catalog/store';

export const metadata: Metadata = {
  title: 'About',
};

export const dynamic = 'force-dynamic';

export default function AboutPage() {
  const stats = catalogStats();
  return (
    <div className="page-prose">
      <p className="eyebrow">About</p>
      <h1>World Audio Repository</h1>
      <p className="lede">
        A curated shelf for RED. The interface is For You, Because you like, and
        Explore — learned from favorites, likes, and YouTube signals. The large
        ingest catalogue is a backend pool for related search, not a public
        directory homepage.
      </p>
      <h2>What this is</h2>
      <p>
        This project started as a podcast player (
        <a href="https://github.com/shantanuraj/podcst-web">podcst-web</a>
        ). We kept the Next.js, TypeScript, and Tailwind bones, plus the idea of
        Podcast Index / RSS ingest. We stripped the player, queue, and account
        shell. v1 is a repository: metadata, search, and deep links.
      </p>
      <h2>What we do not do</h2>
      <ul>
        <li>We do not host or scrape copyrighted audio files.</li>
        <li>
          Copyrighted audiobooks appear as catalogue cards with publisher or
          store links only.
        </li>
        <li>
          YouTube is indexed as channels and series, not downloaded media.
          Homepage recommendation HTML is never scraped; For You uses likes plus
          the YouTube Data API when you configure a key or OAuth token.
        </li>
      </ul>
      <h2>This slice</h2>
      <p>
        Home leads with your graph (Radio Semilla, EcoJustice Radio, 632nm,
        Tangentially Speaking, Planet: Critical, The Great Simplification) and
        learned topics — ecology, climate, agroecology, seeds, science
        interviews, energy. Ranking is never fully deterministic:{' '}
        <code>FOR_YOU_RANDOMNESS</code> (default 0.2) is an epsilon-greedy
        explore rate over the related neighborhood. The ingest pool behind the
        scenes has {stats.titles} titles so related search has somewhere to
        look. Editorial rails on home are labeled <code>Learned: …</code> from
        those weights. Covers use remote feed artwork when present and fall back
        to a generated mark. Read-only catalogue: <code>GET /api/catalog</code>.
        No Postgres, Redis, or API key required to run.
      </p>
      <h2 id="ingest">Ingest path</h2>
      <p>
        Scripts under <code>scripts/</code> write{' '}
        <code>data/catalog.json.gz</code>, which the UI merges with the
        editorial seed. Podcasts pull from the{' '}
        <a href="https://podcastindex.org/">Podcast Index</a> dump (diversity
        sample, default 25k) and an optional Apple storefront harvest.
        Audiobooks paginate LibriVox; YouTube uses a curated list. Owner
        favorites come from the show RSS (not Castbox) via{' '}
        <code>npm run ingest:favorites</code>. Related shows for likes come from
        Podcast Index and Apple via <code>npm run ingest:recommend</code>. For
        You learns topic weights from likes and optional YouTube Data API
        signals via <code>npm run ingest:for-you</code> — it does not scrape the
        YouTube homepage.
      </p>
      <pre>
        <code>
          {`npm run ingest:podcasts
npm run ingest:audiobooks
npm run ingest:youtube
npm run ingest:favorites
npm run ingest:recommend
npm run ingest:for-you`}
        </code>
      </pre>
      <h2>Feed agents</h2>
      <p>
        On a title page, package the card as a JSON packet or a Markdown distill
        brief and send it to your agents — copy, download, or an optional
        webhook (<code>AGENT_FEED_WEBHOOK_URL</code>). Metadata and links only;
        no audio files.
      </p>
      <h2>Translation</h2>
      <p>
        The interface is English. Titles and descriptions can be shown in
        English through a translator abstraction. The default provider uses
        curated local translations in the seed. Set{' '}
        <code>LIBRETRANSLATE_URL</code> (and optionally{' '}
        <code>LIBRETRANSLATE_API_KEY</code>) to use a live service. See{' '}
        <code>.env.example</code>.
      </p>
      <h2>Roadmap</h2>
      <p>
        The longer product plan lives in{' '}
        <Link href="/about#roadmap">PRODUCT.md</Link> in the repository —
        editorial ingest, more languages, and a stable public API. This vertical
        slice is meant to be used, not mocked.
      </p>
    </div>
  );
}
