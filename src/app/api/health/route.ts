import { NextResponse } from 'next/server';
import { loadForYouSnapshot } from '@/catalog/for-you';
import { loadUserSignals, topWeightedTopics } from '@/catalog/signals';
import { catalogStats } from '@/catalog/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const signals = loadUserSignals();
  const snapshot = loadForYouSnapshot();
  return NextResponse.json({
    ok: true,
    name: 'world-audio-repository',
    catalog: catalogStats(),
    learnedAt: signals.learnedAt,
    forYouGeneratedAt: snapshot?.generatedAt ?? null,
    LEARNED_TOPICS: topWeightedTopics(signals, 20),
    homepageScrape: false,
  });
}
