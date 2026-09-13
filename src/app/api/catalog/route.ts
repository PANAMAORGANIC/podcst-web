import { NextResponse } from 'next/server';
import { queryCatalog } from '@/catalog/query';
import type { CatalogSort, CatalogType } from '@/catalog/types';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type') ?? undefined;
  const sort = (url.searchParams.get('sort') ?? undefined) as
    | CatalogSort
    | undefined;
  const limit = Number(url.searchParams.get('limit') ?? '') || undefined;

  const result = queryCatalog({
    q: url.searchParams.get('q') ?? undefined,
    type: isType(type) ? type : 'all',
    language: url.searchParams.get('language') ?? undefined,
    region: url.searchParams.get('region') ?? undefined,
    genre: url.searchParams.get('genre') ?? undefined,
    sort,
    limit,
  });

  return NextResponse.json(result);
}

function isType(value: string | undefined): value is CatalogType {
  return value === 'podcast' || value === 'audiobook' || value === 'youtube';
}
