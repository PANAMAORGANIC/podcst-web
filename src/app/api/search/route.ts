import { NextResponse } from 'next/server';
import { queryCatalog } from '@/catalog/query';

const SEARCH_TTL_MS = 60_000;
const cache = new Map<string, { at: number; body: unknown }>();

/** Shelf search by default. Full 120k snapshot only if CATALOG_FULL=1. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') ?? '';
  const limit = Number(url.searchParams.get('limit') ?? '12') || 12;
  const key = `${q}\t${limit}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < SEARCH_TTL_MS) {
    return NextResponse.json(hit.body);
  }

  const result = queryCatalog({ q, sort: 'relevance', limit });
  const body = {
    items: result.items.map((item) => ({
      id: item.id,
      title: item.title,
      type: item.type,
      creators: item.creators,
      language: item.originalLanguage,
    })),
    total: result.total,
  };
  cache.set(key, { at: Date.now(), body });
  return NextResponse.json(body);
}
