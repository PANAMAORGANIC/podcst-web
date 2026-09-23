export interface TranslationRequest {
  text: string;
  source: string;
  target: string;
}

export interface TranslationResult {
  text: string;
  source: string;
  target: string;
  provider: string;
  cached: boolean;
}

export interface Translator {
  readonly id: string;
  translate(request: TranslationRequest): Promise<TranslationResult>;
}
