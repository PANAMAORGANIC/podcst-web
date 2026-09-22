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
            and source streams only — we do not host audio files. The ingest
            catalogue is a backend pool, not the homepage.
          </p>
        </div>
        <ul className="footer-stats">
          <li>Explore rate {rate}</li>
          <li>
            <code>FOR_YOU_RANDOMNESS</code>
          </li>
        </ul>
        <nav aria-label="Footer">
          <Link href="/library">Library</Link>
          <Link href="/for-you">For you</Link>
          <Link href="/explore">Explore</Link>
          <Link href="/about">About</Link>
          <Link href="/about#ingest">Ingest</Link>
        </nav>
      </div>
    </footer>
  );
}
