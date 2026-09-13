/**
 * Optional YouTube Data API OAuth (subscriptions + liked videos).
 * An API key alone cannot read private mine=true lists.
 * Never scrape youtube.com homepage HTML.
 */

import { fetchJson } from './http';

export type YoutubeOauthConfig = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
};

export function readYoutubeOauthConfig(): YoutubeOauthConfig | null {
  const clientId = process.env.YOUTUBE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.YOUTUBE_OAUTH_CLIENT_SECRET?.trim();
  const refreshToken = process.env.YOUTUBE_OAUTH_REFRESH_TOKEN?.trim();
  if (!clientId || !clientSecret || !refreshToken) return null;
  return { clientId, clientSecret, refreshToken };
}

export async function youtubeAccessToken(
  config: YoutubeOauthConfig,
): Promise<string | null> {
  const result = await fetchJson<{ access_token?: string }>(
    'https://oauth2.googleapis.com/token',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: config.refreshToken,
        grant_type: 'refresh_token',
      }).toString(),
    },
  );
  if (!result.ok) {
    console.warn(`YouTube OAuth token exchange failed (${result.status}).`);
    return null;
  }
  return result.data.access_token ?? null;
}

export async function listMySubscriptions(
  accessToken: string,
): Promise<string[]> {
  const url = new URL('https://www.googleapis.com/youtube/v3/subscriptions');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('mine', 'true');
  url.searchParams.set('maxResults', '50');
  const result = await fetchJson<{
    items?: { snippet?: { resourceId?: { channelId?: string } } }[];
  }>(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!result.ok) {
    console.warn(`subscriptions.list ${result.status}`);
    return [];
  }
  return (result.data.items ?? [])
    .map((item) => item.snippet?.resourceId?.channelId)
    .filter((id): id is string => Boolean(id));
}

export async function listMyLikedVideos(accessToken: string): Promise<
  Array<{
    videoId: string;
    channelId?: string;
    topicCategories?: string[];
  }>
> {
  const url = new URL('https://www.googleapis.com/youtube/v3/videos');
  url.searchParams.set('part', 'snippet,topicDetails');
  url.searchParams.set('myRating', 'like');
  url.searchParams.set('maxResults', '50');
  const result = await fetchJson<{
    items?: {
      id?: string;
      snippet?: { channelId?: string };
      topicDetails?: { topicCategories?: string[] };
    }[];
  }>(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!result.ok) {
    console.warn(`videos.list myRating=like ${result.status}`);
    return [];
  }
  return (result.data.items ?? [])
    .filter((item): item is { id: string } & typeof item => Boolean(item.id))
    .map((item) => ({
      videoId: item.id as string,
      channelId: item.snippet?.channelId,
      topicCategories: item.topicDetails?.topicCategories,
    }));
}

export async function listChannelTopics(
  ids: string[],
  key: string,
  accessToken?: string,
): Promise<Record<string, string[]>> {
  const unique = [...new Set(ids.filter(Boolean))].slice(0, 50);
  if (unique.length === 0) return {};
  const url = new URL('https://www.googleapis.com/youtube/v3/channels');
  url.searchParams.set('part', 'topicDetails');
  url.searchParams.set('id', unique.join(','));
  if (!accessToken) url.searchParams.set('key', key);
  const result = await fetchJson<{
    items?: { id?: string; topicDetails?: { topicCategories?: string[] } }[];
  }>(
    url,
    accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {},
  );
  if (!result.ok) {
    console.warn(`channels.list topics ${result.status}`);
    return {};
  }
  const out: Record<string, string[]> = {};
  for (const item of result.data.items ?? []) {
    if (item.id) out[item.id] = item.topicDetails?.topicCategories ?? [];
  }
  return out;
}
