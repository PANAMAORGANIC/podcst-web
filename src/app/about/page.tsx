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
        A global catalogue whose principal job is completeness across podcasts,
        audiobooks, and long-form YouTube — in as many languages and regions as
        we can honestly describe.
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
        </li>
      </ul>
      <h2>This demo slice</h2>
      <p>
        The running app uses a curated seed of {stats.titles} titles in{' '}
        {stats.languages} languages and {stats.regions} regions. It is large
        enough to search and filter seriously, and small enough to run with{' '}
        <code>npm install</code> and <code>npm run dev</code> — no Postgres,
        Redis, or API key required.
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
        <code>npm run ingest:favorites</code>.
      </p>
      <pre>
        <code>
          {`npm run ingest:podcasts
npm run ingest:audiobooks
npm run ingest:youtube
npm run ingest:favorites`}
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
