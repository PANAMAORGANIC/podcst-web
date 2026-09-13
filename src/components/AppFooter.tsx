import Link from 'next/link';
import { catalogStats } from '@/catalog/seed';

export function AppFooter() {
  const stats = catalogStats();
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <p className="footer-mark">World Audio Repository</p>
          <p className="footer-copy">
            A catalogue of podcasts, audiobooks, and long-form video. Metadata
            and deep links only — we do not host audio files.
          </p>
        </div>
        <ul className="footer-stats">
          <li>
            <strong>{stats.titles}</strong> titles in this demo slice
          </li>
          <li>
            <strong>{stats.languages}</strong> languages
          </li>
          <li>
            <strong>{stats.regions}</strong> regions
          </li>
        </ul>
        <nav aria-label="Footer">
          <Link href="/browse">Browse</Link>
          <Link href="/about">About</Link>
          <Link href="/about#ingest">Ingest</Link>
        </nav>
      </div>
    </footer>
  );
}
