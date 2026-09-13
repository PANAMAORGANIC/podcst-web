import { NextResponse } from 'next/server';
import {
  loadForYouSnapshot,
  loadForYouTitles,
  writeForYouSnapshot,
} from '@/catalog/for-you';
import { exploreRate } from '@/catalog/random';
import {
  applyManualYoutubeSignal,
  loadUserSignals,
  parseYoutubeUrl,
  topWeightedTopics,
} from '@/catalog/signals';

export const dynamic = 'force-dynamic';

export async function GET() {
  const signals = loadUserSignals();
  const snapshot = loadForYouSnapshot();
  const titles = loadForYouTitles(24);
  return NextResponse.json({
    learnedAt: signals.learnedAt,
    generatedAt: snapshot?.generatedAt ?? null,
    sources: signals.sources,
    LEARNED_TOPICS: topWeightedTopics(signals, 20),
    weights: signals.weights,
    youtubeChannelUrls: signals.youtubeChannelUrls,
    youtubeVideoUrls: signals.youtubeVideoUrls,
    importedYoutubeChannelIds: signals.importedYoutubeChannelIds,
    importedYoutubeVideoIds: signals.importedYoutubeVideoIds,
    homepageScrape: false,
    exploreRate: exploreRate(),
    ids: titles.map((title) => title.id),
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    url?: unknown;
  } | null;
  const url = typeof body?.url === 'string' ? body.url.trim() : '';
  if (!url) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 });
  }
  const parsed = parseYoutubeUrl(url);
  if (parsed.kind === 'unknown') {
    return NextResponse.json(
      {
        error:
          'Use a YouTube channel or video URL. Homepage recommendation scraping is out of scope.',
      },
      { status: 400 },
    );
  }
  const { signals } = applyManualYoutubeSignal(url);
  const snapshot = writeForYouSnapshot();
  return NextResponse.json({
    ok: true,
    parsed,
    learnedAt: signals.learnedAt,
    LEARNED_TOPICS: topWeightedTopics(signals, 20),
    youtubeChannelUrls: signals.youtubeChannelUrls,
    youtubeVideoUrls: signals.youtubeVideoUrls,
    ids: snapshot.ids.slice(0, 24),
  });
}
