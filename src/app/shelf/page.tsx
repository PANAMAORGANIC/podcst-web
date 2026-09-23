import type { Metadata } from 'next';
import Link from 'next/link';
import { LibraryShelf } from '@/components/LibraryShelf';

export const metadata: Metadata = {
  title: 'Shelf',
  description: 'Shows you subscribed to on this device.',
};

export default function ShelfPage() {
  return (
    <div className="page-recommend">
      <header className="page-header">
        <p className="eyebrow">Shelf</p>
        <h1>Subscribed shows</h1>
        <p className="lede">
          Only what you Subscribe on a title page. Stored on this phone (
          <code>war-subscriptions-v1</code>). Distinct from Like. We never host
          the audio — only metadata and the publisher stream.
        </p>
        <p className="recommend-more">
          <Link href="/">Library</Link>
          {' · '}
          <Link href="/explore">Explore</Link>
        </p>
      </header>
      <LibraryShelf />
    </div>
  );
}
