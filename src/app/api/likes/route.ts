import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';
import {
  isLikeId,
  LIKED_FILE,
  listFavoriteSeedIds,
  readLikedFile,
  uniqueIds,
} from '@/catalog/likes';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    seeds: listFavoriteSeedIds(),
    liked: readLikedFile(),
  });
}

export async function POST(request: Request) {
  let body: { id?: string; liked?: boolean };
  try {
    body = (await request.json()) as { id?: string; liked?: boolean };
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  const id = body.id?.trim() ?? '';
  if (!isLikeId(id)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }
  const current = readLikedFile();
  const next =
    body.liked === false
      ? current.filter((item) => item !== id)
      : uniqueIds([...current, id]);
  mkdirSync(path.dirname(LIKED_FILE), { recursive: true });
  writeFileSync(
    LIKED_FILE,
    `${JSON.stringify({ ids: next, updatedAt: new Date().toISOString() }, null, 2)}\n`,
  );
  return NextResponse.json({
    ok: true,
    seeds: listFavoriteSeedIds(),
    liked: next,
  });
}
