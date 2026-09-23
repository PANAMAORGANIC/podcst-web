import { SUBSCRIPTIONS_STORAGE_KEY } from './like-constants';

export { SUBSCRIPTIONS_STORAGE_KEY };

export function parseSubscriptionIds(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return [
      ...new Set(
        parsed.filter(
          (id): id is string => typeof id === 'string' && id.length > 0,
        ),
      ),
    ];
  } catch {
    return [];
  }
}
