import { NextResponse } from 'next/server';
import { queryCatalog } from '@/catalog/query';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') ?? '';
  const limit = Number(url.searchParams.get('limit') ?? '12') || 12;
  const result = queryCatalog({ q, sort: 'relevance', limit });
  return NextResponse.json({
    items: result.items.map((item) => ({
      id: item.id,
      title: item.title,
      type: item.type,
      creators: item.creators,
      language: item.originalLanguage,
    })),
    total: result.total,
  });
}
