import { NextResponse } from 'next/server';
import { listSeedEntries, resolveLikeIds, uniqueIds } from '@/catalog/likes';
import { recommendRails } from '@/catalog/recommend';
import { getCatalog, getEntry } from '@/catalog/store';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get('limit') ?? '8') || 8;
  const seedParam = url.searchParams.get('seed');
  const seedsParam = url.searchParams.get('seeds');
  const catalog = getCatalog();

  if (seedParam) {
    const seed = getEntry(seedParam);
    if (!seed) {
      return NextResponse.json(
        { error: 'unknown seed', rails: [] },
        { status: 404 },
      );
    }
    const rails = recommendRails([seed], catalog, limit);
    return NextResponse.json({ rails, seed: compact(seed) });
  }

  const requested = uniqueIds(
    (seedsParam ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean),
  );
  const seeds = requested.length
    ? resolveLikeIds(requested)
    : listSeedEntries();
  const rails = recommendRails(seeds.slice(0, 12), catalog, limit);
  return NextResponse.json({
    rails,
    seeds: seeds.map(compact),
  });
}

function compact(entry: {
  id: string;
  title: string;
  originalLanguage: string;
}) {
  return {
    id: entry.id,
    title: entry.title,
    language: entry.originalLanguage,
  };
}
