import { NextResponse } from 'next/server';
import { catalogStats } from '@/catalog/seed';

export async function GET() {
  return NextResponse.json({
    ok: true,
    name: 'world-audio-repository',
    catalog: catalogStats(),
  });
}
