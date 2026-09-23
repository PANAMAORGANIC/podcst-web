import type {
  TranslationRequest,
  TranslationResult,
  Translator,
} from './types';

interface LibreTranslateResponse {
  translatedText?: string;
  error?: string;
}

/**
 * Optional live translator. Configure via LIBRETRANSLATE_URL.
 * An API key is sent only when LIBRETRANSLATE_API_KEY is set.
 */
export class LibreTranslateTranslator implements Translator {
  readonly id = 'libretranslate';

  constructor(
    private readonly endpoint: string,
    private readonly apiKey?: string,
  ) {}

  async translate(request: TranslationRequest): Promise<TranslationResult> {
    const url = new URL('/translate', this.endpoint);
    const body: Record<string, string> = {
      q: request.text,
      source: request.source,
      target: request.target,
      format: 'text',
    };
    if (this.apiKey) {
      body.api_key = this.apiKey;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`LibreTranslate failed (${response.status})`);
    }

    const data = (await response.json()) as LibreTranslateResponse;
    if (!data.translatedText) {
      throw new Error(data.error || 'LibreTranslate returned no text');
    }

    return {
      text: data.translatedText,
      source: request.source,
      target: request.target,
      provider: this.id,
      cached: false,
    };
  }
}
