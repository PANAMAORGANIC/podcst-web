import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="page-prose">
      <p className="eyebrow">404</p>
      <h1>This title is not in the repository.</h1>
      <p className="lede">
        The card may have moved, or the identifier is new. Search from the home
        page or browse by type.
      </p>
      <p>
        <Link href="/">Return to the library</Link>
        {' · '}
        <Link href="/shelf">Shelf</Link>
      </p>
    </div>
  );
}
