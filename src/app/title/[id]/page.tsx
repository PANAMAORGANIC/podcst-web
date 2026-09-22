import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { listFavoriteSeedIds } from '@/catalog/likes';
import { relatedEntries } from '@/catalog/query';
import { recommendFor } from '@/catalog/recommend';
import { getCatalog, getEntry } from '@/catalog/store';
import { CatalogGrid } from '@/components/CatalogGrid';
import { EpisodeList } from '@/components/player/EpisodeList';
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
  const because = recommendFor(entry, getCatalog(), 8);
  const seedIds = listFavoriteSeedIds();

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
      <TitleDetail entry={entry} seedIds={seedIds} />
      <EpisodeList entry={entry} />
      {because.length > 0 ? (
        <section className="related">
          <h2>Because you like {entry.title}</h2>
          <CatalogGrid items={because} />
        </section>
      ) : null}
      {related.length > 0 && because.length === 0 ? (
        <section className="related">
          <h2>Related in language, region, or genre</h2>
          <CatalogGrid items={related} />
        </section>
      ) : null}
    </div>
  );
}
