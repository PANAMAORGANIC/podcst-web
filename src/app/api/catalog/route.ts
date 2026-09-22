import { NextResponse } from 'next/server';
import {
  CATALOG_API_DEFAULT_LIMIT,
  CATALOG_API_MAX_LIMIT,
  clampCatalogLimit,
  clampCatalogOffset,
  toPublicCatalogItem,
} from '@/catalog/public';
import { queryCatalog } from '@/catalog/query';
import { getEntry } from '@/catalog/store';
import type { CatalogSort, CatalogType } from '@/catalog/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id')?.trim();
  if (id) {
    const entry = getEntry(id);
    if (!entry) {
      return NextResponse.json({ error: 'not found', id }, { status: 404 });
    }
    return NextResponse.json({ item: toPublicCatalogItem(entry) });
  }

  const type = url.searchParams.get('type') ?? undefined;
  const sort = (url.searchParams.get('sort') ?? undefined) as
    | CatalogSort
    | undefined;
  const limit = clampCatalogLimit(
    Number(url.searchParams.get('limit') ?? CATALOG_API_DEFAULT_LIMIT),
  );
  const offset = clampCatalogOffset(
    Number(url.searchParams.get('offset') ?? 0),
  );

  const result = queryCatalog({
    q: url.searchParams.get('q') ?? undefined,
    type: isType(type) ? type : 'all',
    language: url.searchParams.get('language') ?? undefined,
    region: url.searchParams.get('region') ?? undefined,
    genre: url.searchParams.get('genre') ?? undefined,
    sort,
    limit,
    offset,
  });

  const nextOffset =
    offset + result.items.length < result.total
      ? offset + result.items.length
      : null;

  return NextResponse.json({
    items: result.items.map(toPublicCatalogItem),
    total: result.total,
    limit,
    offset,
    nextOffset,
    maxLimit: CATALOG_API_MAX_LIMIT,
  });
}

function isType(value: string | undefined): value is CatalogType {
  return value === 'podcast' || value === 'audiobook' || value === 'youtube';
}
