import Link from 'next/link';
import { exploreRate } from '@/catalog/random';

export function AppFooter() {
  const rate = exploreRate();
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <p className="footer-mark">World Audio Repository</p>
          <p className="footer-copy">
            Curated for RED from likes, favorites, and YouTube signals. Metadata
            and source streams only — we do not host audio files. Library is
            home; Shelf is subscriptions. The ingest catalogue is a backend
            pool.
          </p>
        </div>
        <ul className="footer-stats">
          <li>Explore rate {rate}</li>
          <li>
            <code>FOR_YOU_RANDOMNESS</code>
          </li>
        </ul>
        <nav aria-label="Footer">
          <Link href="/">Library</Link>
          <Link href="/shelf">Shelf</Link>
          <Link href="/explore">Explore</Link>
          <Link href="/about">About</Link>
          <Link href="/about#ingest">Ingest</Link>
        </nav>
      </div>
    </footer>
  );
}
