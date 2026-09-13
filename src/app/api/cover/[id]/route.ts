import { NextResponse } from 'next/server';
import { renderCoverSvg } from '@/catalog/cover';
import { getEntry } from '@/catalog/seed';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const entry = getEntry(id);
  if (!entry) {
    return new NextResponse('Not found', { status: 404 });
  }

  return new NextResponse(renderCoverSvg(entry), {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
