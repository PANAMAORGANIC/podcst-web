import { NextResponse } from 'next/server';
import {
  isLikeId,
  listFavoriteSeedIds,
  readLikedFile,
  uniqueIds,
  writeLikedFile,
} from '@/catalog/likes';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    seeds: listFavoriteSeedIds(),
    liked: readLikedFile(),
    persist: 'local-first',
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
  const persisted = writeLikedFile(next);
  return NextResponse.json({
    ok: true,
    persisted,
    persist: persisted ? 'disk' : 'local-first',
    seeds: listFavoriteSeedIds(),
    liked: next,
  });
}
