import { LibreTranslateTranslator } from './libretranslate';
import { LocalCatalogTranslator } from './local';
import type {
  TranslationRequest,
  TranslationResult,
  Translator,
} from './types';

const memory = new Map<string, TranslationResult>();

function cacheKey(request: TranslationRequest): string {
  return `${request.source}:${request.target}:${request.text}`;
}

export function getTranslator(): Translator {
  const url = process.env.LIBRETRANSLATE_URL;
  if (url) {
    return new LibreTranslateTranslator(
      url,
      process.env.LIBRETRANSLATE_API_KEY,
    );
  }
  return new LocalCatalogTranslator();
}

export async function translateText(
  request: TranslationRequest,
): Promise<TranslationResult> {
  const key = cacheKey(request);
  const hit = memory.get(key);
  if (hit) {
    return { ...hit, cached: true };
  }

  const local = new LocalCatalogTranslator();
  const localResult = await local.translate(request);
  if (localResult.text !== request.text || request.source === request.target) {
    memory.set(key, localResult);
    return localResult;
  }

  const translator = getTranslator();
  if (translator.id === local.id) {
    memory.set(key, localResult);
    return localResult;
  }

  const live = await translator.translate(request);
  memory.set(key, live);
  return live;
}

export type { TranslationRequest, TranslationResult, Translator };
