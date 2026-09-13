import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { relatedEntries } from '@/catalog/query';
import { getEntry } from '@/catalog/store';
import { CatalogGrid } from '@/components/CatalogGrid';
import { TitleDetail } from '@/components/TitleDetail';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const entry = getEntry(id);
  if (!entry) return { title: 'Not found' };
  return {
    title: entry.title,
    description: entry.description.slice(0, 160),
  };
}

export default async function TitlePage({ params }: PageProps) {
  const { id } = await params;
  const entry = getEntry(id);
  if (!entry) notFound();
  const related = relatedEntries(entry);

  return (
    <div className="page-title">
      <p className="crumb">
        <Link
          href={`/${entry.type === 'youtube' ? 'youtube' : `${entry.type}s`}`}
        >
          {entry.type}
        </Link>
        <span aria-hidden="true"> / </span>
        <span>{entry.id}</span>
      </p>
      <TitleDetail entry={entry} />
      {related.length > 0 ? (
        <section className="related">
          <h2>Related in language, region, or genre</h2>
          <CatalogGrid items={related} />
        </section>
      ) : null}
    </div>
  );
}
