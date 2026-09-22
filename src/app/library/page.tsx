import type { Metadata } from 'next';
import Link from 'next/link';
import { LibraryShelf } from '@/components/LibraryShelf';

export const metadata: Metadata = {
  title: 'Library',
  description: 'Shows you subscribed to on this device.',
};

export default function LibraryPage() {
  return (
    <div className="page-recommend">
      <header className="page-header">
        <p className="eyebrow">Library</p>
        <h1>Shows you keep</h1>
        <p className="lede">
          Subscribe is stored on this phone (<code>war-subscriptions-v1</code>
          ). Distinct from Like. We never host the audio — only metadata and the
          publisher stream.
        </p>
        <p className="recommend-more">
          <Link href="/">Shelf</Link>
          {' · '}
          <Link href="/explore">Explore</Link>
        </p>
      </header>
      <LibraryShelf />
    </div>
  );
}
