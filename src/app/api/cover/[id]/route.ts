import { NextResponse } from 'next/server';
import { resolveArtworkUrl } from '@/catalog/artwork';
import { renderCoverSvg } from '@/catalog/cover';
import { getEntry } from '@/catalog/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 800_000;
const proxyCache = new Map<
  string,
  { body: Uint8Array; type: string; at: number }
>();
const PROXY_TTL_MS = 24 * 60 * 60 * 1000;

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const entry = getEntry(id);
  if (!entry) {
    return new NextResponse('Not found', { status: 404 });
  }

  const remote = await resolveArtworkUrl(entry);
  if (remote) {
    const proxied = await proxyArtwork(remote);
    if (proxied) {
      const body = Buffer.from(proxied.body);
      return new NextResponse(body, {
        headers: {
          'Content-Type': proxied.type,
          'Content-Length': String(body.byteLength),
          'Cache-Control': 'public, max-age=86400, immutable',
          'X-Content-Type-Options': 'nosniff',
          'Cross-Origin-Resource-Policy': 'cross-origin',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }

  const svg = renderCoverSvg(entry);
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Content-Length': String(Buffer.byteLength(svg)),
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

async function proxyArtwork(
  url: string,
): Promise<{ body: Uint8Array; type: string } | null> {
  const hit = proxyCache.get(url);
  if (hit && Date.now() - hit.at < PROXY_TTL_MS) return hit;
  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'image/avif,image/webp,image/*,*/*;q=0.8',
        'User-Agent': 'WorldAudioRepository/1.0',
      },
      signal: AbortSignal.timeout(4000),
      redirect: 'follow',
    });
    if (!response.ok) return null;
    const type = response.headers.get('content-type') ?? '';
    if (!type.startsWith('image/')) return null;
    const buffer = new Uint8Array(await response.arrayBuffer());
    if (!buffer.byteLength || buffer.byteLength > MAX_BYTES) return null;
    const payload = { body: buffer, type: type.split(';')[0], at: Date.now() };
    proxyCache.set(url, payload);
    return payload;
  } catch {
    return null;
  }
}
