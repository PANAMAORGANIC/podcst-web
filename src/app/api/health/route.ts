import { NextResponse } from 'next/server';
import { catalogRuntime } from '@/catalog/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    ok: true,
    name: 'world-audio-repository',
    catalog: catalogRuntime(),
    homepageScrape: false,
    curatedHome: true,
    player: 'source-stream',
    pwa: true,
    likesPersist: 'local-first',
  });
}
