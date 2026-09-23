/** Known UC… ids for seed / curated handles. Used so Railway seed mode
 * can hit YouTube’s official Atom RSS without YOUTUBE_API_KEY. */
const BY_SHOW_ID: Record<string, string> = {
  'lex-fridman': 'UCSHZKyawb77ixDdsGog4iWA',
  dwarkesh: 'UCXl4i9dYBrFOabk0xGmbkRA',
  veritasium: 'UCHnyfMqiRRG1u-2MsSQLbXA',
  kurzgesagt: 'UCsXVk37bltHxD1rDPwtNM8Q',
  contraposoints: 'UCNvsIonJdJ5E4EXMa65VYpA',
  'nota-bene': 'UCP46_MXP_WG_auH88FnfS1A',
  mrwissen2go: 'UCZHpIFMfoJJ_1QxNGLJTzyA',
  'nakata-atsuhiko': 'UCcg5kwxeyHZ4zcQSbg7VqZw',
  'suka-world': 'UCsJ6RuBiTVWRX156FVbeaGg',
  laogao: 'UCOUKo8QQ-6ADVRQetG1_Yjw',
  'manual-do-mundo': 'UCKHhA5hN2UohhFDfNXB_cvQ',
  'en-pocas-palabras': 'UCutHHoZ4kzZFM2LCiZR_dVA',
  'aj-plus-ar': 'UCnVGseMUtv2yFNC-dQ2JdSw',
  'cna-insider': 'UC_Lnb8ZHqqgLbp-7hltuT9w',
  'nhk-world': 'UCSPEjw8F2nQDtmUKPFNF7_A',
  ted: 'UCAuUUnT6oDeKwE6v1NGQxug',
  crashcourse: 'UCX6b17PVsYBQ0ip5gyeme-Q',
  'pbs-space-time': 'UC7_gcs09iThXybpVgjHZ_7g',
  'the-wire-india': 'UChWtJey46brNr7qHQpN6KLQ',
  'al-jazeera-english': 'UCNye-wNBqNL5ZzHSJj3l8Bg',
  numberphile: 'UCoxcjq-8xIDTYp3uqm-KdKQ',
  'school-of-life': 'UC7IcJI8PUf5Z3zKxnZvTBog',
  deshbhakt: 'UCmTM_hPCeckqN3cPWtYZZcg',
  'vortex-arte': 'UCNgrOkwjifJe5z4jCexSpnA',
  'thai-the-standard': 'UCk1v3FzlMu3r34LYgoHpH2w',
  'tv-peru-quechua': 'UC7si3uXy0UVIkuMz5B_rzgw',
};

const BY_HANDLE: Record<string, string> = {
  lexfridman: 'UCSHZKyawb77ixDdsGog4iWA',
  dwarkeshpatel: 'UCXl4i9dYBrFOabk0xGmbkRA',
  veritasium: 'UCHnyfMqiRRG1u-2MsSQLbXA',
  kurzgesagt: 'UCsXVk37bltHxD1rDPwtNM8Q',
  contrapoints: 'UCNvsIonJdJ5E4EXMa65VYpA',
  notabenemovies: 'UCP46_MXP_WG_auH88FnfS1A',
  mrwissen2go: 'UCZHpIFMfoJJ_1QxNGLJTzyA',
  nakatauniversity: 'UCcg5kwxeyHZ4zcQSbg7VqZw',
  syukaworld: 'UCsJ6RuBiTVWRX156FVbeaGg',
  mrnmt: 'UCOUKo8QQ-6ADVRQetG1_Yjw',
  manualdomundo: 'UCKHhA5hN2UohhFDfNXB_cvQ',
  enpocaspalabras: 'UCutHHoZ4kzZFM2LCiZR_dVA',
  ajplusarabi: 'UCnVGseMUtv2yFNC-dQ2JdSw',
  cnainsider: 'UC_Lnb8ZHqqgLbp-7hltuT9w',
  nhkworldjapan: 'UCSPEjw8F2nQDtmUKPFNF7_A',
  ted: 'UCAuUUnT6oDeKwE6v1NGQxug',
  crashcourse: 'UCX6b17PVsYBQ0ip5gyeme-Q',
  pbsspacetime: 'UC7_gcs09iThXybpVgjHZ_7g',
  thewirenews: 'UChWtJey46brNr7qHQpN6KLQ',
  aljazeeraenglish: 'UCNye-wNBqNL5ZzHSJj3l8Bg',
  numberphile: 'UCoxcjq-8xIDTYp3uqm-KdKQ',
  theschooloflifetv: 'UC7IcJI8PUf5Z3zKxnZvTBog',
  thedeshbhakt: 'UCmTM_hPCeckqN3cPWtYZZcg',
  levortexoff: 'UCNgrOkwjifJe5z4jCexSpnA',
  thestandardnews: 'UCk1v3FzlMu3r34LYgoHpH2w',
  tvperuoficial: 'UC7si3uXy0UVIkuMz5B_rzgw',
};

export function knownYoutubeChannelId(
  showId?: string,
  handle?: string,
): string | undefined {
  if (showId && BY_SHOW_ID[showId]) return BY_SHOW_ID[showId];
  if (handle) return BY_HANDLE[handle.toLowerCase()];
  return undefined;
}
