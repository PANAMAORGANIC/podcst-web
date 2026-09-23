import { NextResponse } from 'next/server';
import { catalogRuntime } from '@/catalog/store';
import { hasYoutubeApiKey } from '@/player/youtube-feed';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    ok: true,
    name: 'world-audio-repository',
    catalog: catalogRuntime(),
    homepageScrape: false,
    curatedHome: true,
    player: 'source-stream',
    youtubeEpisodes: 'on-demand',
    youtubeDataApi: hasYoutubeApiKey(),
    pwa: true,
    likesPersist: 'local-first',
  });
}
