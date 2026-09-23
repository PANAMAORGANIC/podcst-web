import { getCatalog, getEntry } from '@/catalog/store';
import type { CatalogEntry } from '@/catalog/types';
import type {
  TranslationRequest,
  TranslationResult,
  Translator,
} from './types';

function looksLike(text: string, candidate: string): boolean {
  return text.trim() === candidate.trim();
}

function findSeededEnglish(request: TranslationRequest): string | undefined {
  if (request.target !== 'en' || request.source === 'en') {
    return undefined;
  }

  for (const entry of getCatalog()) {
    const english = matchEntry(entry, request);
    if (english) return english;
  }
  return undefined;
}

function matchEntry(
  entry: CatalogEntry,
  request: TranslationRequest,
): string | undefined {
  if (entry.originalLanguage !== request.source) return undefined;
  const english = entry.translations?.en;
  if (!english) return undefined;
  if (looksLike(request.text, entry.title)) return english.title;
  if (looksLike(request.text, entry.description)) return english.description;
  return undefined;
}

/**
 * Uses curated English fields on catalog records. No network.
 * This is the default translator so the app works without API keys.
 */
export class LocalCatalogTranslator implements Translator {
  readonly id = 'local-catalog';

  async translate(request: TranslationRequest): Promise<TranslationResult> {
    const seeded = findSeededEnglish(request);
    return {
      text: seeded ?? request.text,
      source: request.source,
      target: request.target,
      provider: this.id,
      cached: true,
    };
  }
}

export function englishForEntry(id: string): {
  title: string;
  description: string;
} | null {
  const entry = getEntry(id);
  if (!entry) return null;
  if (entry.originalLanguage === 'en') {
    return { title: entry.title, description: entry.description };
  }
  return entry.translations?.en ?? null;
}
