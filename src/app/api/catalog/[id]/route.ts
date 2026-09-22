import { NextResponse } from 'next/server';
import { toPublicCatalogItem } from '@/catalog/public';
import { getEntry } from '@/catalog/store';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const entry = getEntry(id);
  if (!entry) {
    return NextResponse.json({ error: 'not found', id }, { status: 404 });
  }
  return NextResponse.json({ item: toPublicCatalogItem(entry) });
}
