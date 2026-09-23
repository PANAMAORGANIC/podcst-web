export const LIKED_STORAGE_KEY = 'war-liked-ids';
export const SUBSCRIPTIONS_STORAGE_KEY = 'war-subscriptions-v1';

export function isLikeId(value: string): boolean {
  return /^[a-z][a-z0-9-]{2,80}$/.test(value);
}
