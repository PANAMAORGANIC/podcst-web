import { NextResponse } from 'next/server';
import { searchWar } from '@/catalog/search';

const SEARCH_TTL_MS = 45_000;
const cache = new Map<string, { at: number; body: unknown }>();

/** Shelf search by default. Full 120k snapshot only if CATALOG_FULL=1. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') ?? '';
  const boost = (url.searchParams.get('boost') ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 40);
  const key = `${q}\t${boost.join(',')}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < SEARCH_TTL_MS) {
    return NextResponse.json(hit.body);
  }

  const body = await searchWar({ q, boostIds: boost });
  cache.set(key, { at: Date.now(), body });
  return NextResponse.json(body);
}
