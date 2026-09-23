import { createHash } from 'node:crypto';
import { fetchJson } from './http';

const UA =
  'WorldAudioRepository/1.0 (+https://github.com/PANAMAORGANIC/podcst-web)';

export interface PiFeed {
  id: number;
  title?: string;
  url?: string;
  originalUrl?: string;
  link?: string;
  description?: string;
  author?: string;
  image?: string;
  language?: string;
  episodeCount?: number;
  itunesId?: number;
  categories?: Record<string, string>;
}

export function podcastIndexConfigured(): boolean {
  return Boolean(
    process.env.PODCASTINDEX_API_KEY?.trim() &&
      process.env.PODCASTINDEX_API_SECRET?.trim(),
  );
}

function headers(): Record<string, string> {
  const key = process.env.PODCASTINDEX_API_KEY?.trim() ?? '';
  const secret = process.env.PODCASTINDEX_API_SECRET?.trim() ?? '';
  const apiHeaderTime = Math.floor(Date.now() / 1000).toString();
  const authorization = createHash('sha1')
    .update(key + secret + apiHeaderTime)
    .digest('hex');
  return {
    'X-Auth-Key': key,
    'X-Auth-Date': apiHeaderTime,
    Authorization: authorization,
    'User-Agent': UA,
  };
}

async function piGet<T>(
  path: string,
  params: Record<string, string>,
): Promise<T | null> {
  if (!podcastIndexConfigured()) return null;
  const url = new URL(`https://api.podcastindex.org/api/1.0${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const result = await fetchJson<T>(url, { headers: headers() });
  if (!result.ok) return null;
  return result.data;
}

export async function podcastIndexByFeed(
  feedUrl: string,
): Promise<PiFeed | null> {
  const data = await piGet<{ feed?: PiFeed }>('/podcasts/byfeedurl', {
    url: feedUrl,
  });
  return data?.feed ?? null;
}

export async function podcastIndexByItunes(
  itunesId: number,
): Promise<PiFeed | null> {
  const data = await piGet<{ feed?: PiFeed }>('/podcasts/byitunesid', {
    id: String(itunesId),
  });
  return data?.feed ?? null;
}

export async function podcastIndexSearch(
  term: string,
  max = 12,
): Promise<PiFeed[]> {
  const data = await piGet<{ feeds?: PiFeed[] }>('/search/byterm', {
    q: term,
    max: String(max),
  });
  return data?.feeds ?? [];
}

export async function podcastIndexRelated(
  id: number,
  max = 20,
): Promise<PiFeed[]> {
  const related = await piGet<{ feeds?: PiFeed[] }>('/related/podcasts', {
    id: String(id),
    max: String(max),
  });
  if (related?.feeds?.length) return related.feeds;
  const alt = await piGet<{ feeds?: PiFeed[] }>('/podcasts/related', {
    id: String(id),
    max: String(max),
  });
  return alt?.feeds ?? [];
}
