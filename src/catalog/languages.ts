export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  script: string;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', script: 'Ethiopic' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', script: 'Arabic' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali' },
  { code: 'ca', name: 'Catalan', nativeName: 'Català', script: 'Latin' },
  { code: 'cy', name: 'Welsh', nativeName: 'Cymraeg', script: 'Latin' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', script: 'Latin' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', script: 'Greek' },
  { code: 'en', name: 'English', nativeName: 'English', script: 'Latin' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', script: 'Latin' },
  { code: 'eu', name: 'Basque', nativeName: 'Euskara', script: 'Latin' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', script: 'Arabic' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', script: 'Latin' },
  { code: 'fr', name: 'French', nativeName: 'Français', script: 'Latin' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa', script: 'Latin' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', script: 'Hebrew' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', script: 'Latin' },
  {
    code: 'id',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    script: 'Latin',
  },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska', script: 'Latin' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', script: 'Latin' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', script: 'Japanese' },
  { code: 'km', name: 'Khmer', nativeName: 'ខ្មែរ', script: 'Khmer' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', script: 'Hangul' },
  { code: 'la', name: 'Latin', nativeName: 'Latina', script: 'Latin' },
  { code: 'mi', name: 'Māori', nativeName: 'Te Reo Māori', script: 'Latin' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', script: 'Latin' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', script: 'Devanagari' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', script: 'Latin' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', script: 'Latin' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', script: 'Latin' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', script: 'Latin' },
  { code: 'qu', name: 'Quechua', nativeName: 'Runasimi', script: 'Latin' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', script: 'Latin' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', script: 'Cyrillic' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', script: 'Devanagari' },
  { code: 'so', name: 'Somali', nativeName: 'Soomaali', script: 'Latin' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', script: 'Latin' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', script: 'Latin' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', script: 'Thai' },
  { code: 'tl', name: 'Filipino', nativeName: 'Filipino', script: 'Latin' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', script: 'Latin' },
  {
    code: 'uk',
    name: 'Ukrainian',
    nativeName: 'Українська',
    script: 'Cyrillic',
  },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', script: 'Arabic' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', script: 'Latin' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', script: 'Latin' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', script: 'Han' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', script: 'Latin' },
];

const LANGUAGE_BY_CODE = new Map(LANGUAGES.map((lang) => [lang.code, lang]));

export function getLanguage(code: string): LanguageInfo {
  return (
    LANGUAGE_BY_CODE.get(code) ?? {
      code,
      name: code.toUpperCase(),
      nativeName: code,
      script: 'Unknown',
    }
  );
}

export function languageLabel(code: string): string {
  const lang = getLanguage(code);
  return lang.name === lang.nativeName
    ? lang.name
    : `${lang.name} · ${lang.nativeName}`;
}
