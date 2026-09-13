export const LIKED_STORAGE_KEY = 'war-liked-ids';

export function isLikeId(value: string): boolean {
  return /^[a-z][a-z0-9-]{2,80}$/.test(value);
}
