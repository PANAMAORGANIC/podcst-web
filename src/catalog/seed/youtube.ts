import { youtube } from './helpers';

export const YOUTUBE = [
  youtube({
    id: 'lex-fridman',
    title: 'Lex Fridman Podcast',
    language: 'en',
    creators: ['Lex Fridman'],
    description:
      'Long interviews on AI, physics, history, and the people who build systems. Audio-adjacent video: the point is the conversation, not the cut.',
    tags: ['interview', 'ai', 'longform', 'science'],
    genres: ['ideas', 'science'],
    region: 'north-america',
    country: 'United States',
    countryCode: 'US',
    urls: {
      youtube: 'https://www.youtube.com/@lexfridman',
      website: 'https://lexfridman.com/',
      rss: 'https://lexfridman.com/feed/podcast/',
    },
    signals: { popularity: 94, diversity: 25 },
    year: 2018,
  }),
  youtube({
    id: 'dwarkesh',
    title: 'Dwarkesh Patel',
    language: 'en',
    creators: ['Dwarkesh Patel'],
    description:
      'Patient interviews with researchers and builders. A younger long-form tradition that still assumes the audience can sit still.',
    tags: ['interview', 'ai', 'progress', 'longform'],
    genres: ['ideas', 'science'],
    region: 'north-america',
    country: 'United States',
    countryCode: 'US',
    urls: {
      youtube: 'https://www.youtube.com/@DwarkeshPatel',
      website: 'https://www.dwarkesh.com/',
    },
    signals: { popularity: 76, diversity: 33 },
    year: 2019,
  }),
  youtube({
    id: 'veritasium',
    title: 'Veritasium',
    language: 'en',
    creators: ['Derek Muller'],
    description:
      'Science films that start with a wrong intuition and stay until the experiment is done. Educational video that works with the sound off — and better on.',
    tags: ['science', 'education', 'physics', 'documentary'],
    genres: ['education', 'science'],
    region: 'oceania',
    country: 'Australia',
    countryCode: 'AU',
    urls: {
      youtube: 'https://www.youtube.com/@veritasium',
      website: 'https://www.veritasium.com/',
    },
    signals: { popularity: 95, diversity: 29 },
    year: 2011,
  }),
  youtube({
    id: 'kurzgesagt',
    title: 'Kurzgesagt – In a Nutshell',
    language: 'en',
    creators: ['Kurzgesagt'],
    description:
      'Munich-made explainers on space, biology, and existential risk. A German studio speaking a global English — and now many other languages.',
    tags: ['animation', 'science', 'explainer', 'munich'],
    genres: ['education', 'science'],
    region: 'central-europe',
    country: 'Germany',
    countryCode: 'DE',
    urls: {
      youtube: 'https://www.youtube.com/@kurzgesagt',
      website: 'https://kurzgesagt.org/',
    },
    signals: { popularity: 97, diversity: 40 },
    year: 2013,
  }),
  youtube({
    id: 'contraposoints',
    title: 'ContraPoints',
    language: 'en',
    creators: ['Natalie Wynn'],
    description:
      'Essay-films on gender, politics, and the internet’s worse arguments. Costume, dialectic, and a runtime that assumes you stayed.',
    tags: ['essay', 'politics', 'gender', 'longform'],
    genres: ['ideas', 'culture'],
    region: 'north-america',
    country: 'United States',
    countryCode: 'US',
    urls: {
      youtube: 'https://www.youtube.com/@ContraPoints',
    },
    signals: { popularity: 83, diversity: 48 },
    year: 2016,
  }),
  youtube({
    id: 'nota-bene',
    title: 'Nota Bene',
    language: 'fr',
    creators: ['Benjamin Brillaud'],
    description:
      'Histoire sur YouTube en français: Antiquité, Moyen Âge, anecdotes sourcées. Une chaîne qui traite le commentaire comme une salle de classe.',
    tags: ['history', 'france', 'education', 'antiquity'],
    genres: ['history', 'education'],
    region: 'western-europe',
    country: 'France',
    countryCode: 'FR',
    urls: {
      youtube: 'https://www.youtube.com/@notabenemovies',
    },
    signals: { popularity: 74, diversity: 56 },
    year: 2014,
    english: {
      title: 'Nota Bene',
      description:
        'History on YouTube in French: antiquity, the Middle Ages, sourced anecdotes. A channel that treats the comments as a classroom.',
    },
  }),
  youtube({
    id: 'mrwissen2go',
    title: 'MrWissen2go',
    language: 'de',
    creators: ['Mirko Drotschmann'],
    description:
      'Politik und Geschichte auf Deutsch, ohne Studio-Panik. Öffentlich-rechtlicher Ton auf einer privaten Plattform.',
    tags: ['germany', 'politics', 'history', 'explainer'],
    genres: ['education', 'current-affairs'],
    region: 'central-europe',
    country: 'Germany',
    countryCode: 'DE',
    urls: {
      youtube: 'https://www.youtube.com/@MrWissen2go',
    },
    signals: { popularity: 78, diversity: 49 },
    english: {
      title: 'MrWissen2go',
      description:
        'Politics and history in German, without studio panic. A public-service tone on a private platform.',
    },
  }),
  youtube({
    id: 'nakata-atsuhiko',
    title: '中田敦彦のYouTube大学',
    language: 'ja',
    creators: ['中田敦彦'],
    description:
      '黒板と長尺。ビジネス書、歴史、受験。日本語の講義がテレビより長く座れる場所。',
    tags: ['japan', 'lecture', 'books', 'education'],
    genres: ['education', 'ideas'],
    region: 'east-asia',
    country: 'Japan',
    countryCode: 'JP',
    urls: {
      youtube: 'https://www.youtube.com/@nakatauniversity',
    },
    signals: { popularity: 85, diversity: 62 },
    english: {
      title: "Atsuhiko Nakata's YouTube University",
      description:
        'A blackboard and a long clock. Business books, history, entrance exams. A place where a Japanese lecture can outlast television.',
    },
  }),
  youtube({
    id: 'suka-world',
    title: '슈카월드',
    language: 'ko',
    creators: ['슈카'],
    description:
      '경제와 금융을 한국말로, 칠판 앞에서. 뉴스보다 길고 강의보다 헐거움.',
    tags: ['korea', 'economics', 'finance', 'explainer'],
    genres: ['education', 'business'],
    region: 'east-asia',
    country: 'South Korea',
    countryCode: 'KR',
    urls: {
      youtube: 'https://www.youtube.com/@syukaworld',
    },
    signals: { popularity: 80, diversity: 65 },
    english: {
      title: 'Suka World',
      description:
        'Economics and finance in Korean, at a blackboard. Longer than the news, looser than a lecture.',
    },
  }),
  youtube({
    id: 'laogao',
    title: '老高與小茉 Mr & Mrs Gao',
    language: 'zh',
    creators: ['老高', '小茉'],
    description:
      '華語長視頻：神秘學、歷史冷知識、故事腔。評論區比演播室更像廣場。',
    tags: ['chinese', 'storytelling', 'mystery', 'longform'],
    genres: ['entertainment', 'storytelling'],
    region: 'east-asia',
    country: 'Taiwan',
    countryCode: 'TW',
    urls: {
      youtube: 'https://www.youtube.com/@mrnmt',
    },
    signals: { popularity: 88, diversity: 71 },
    english: {
      title: 'Mr & Mrs Gao',
      description:
        'Mandarin long video: occult histories, cold facts, a storyteller’s cadence. The comments are more public square than studio.',
    },
  }),
  youtube({
    id: 'manual-do-mundo',
    title: 'Manual do Mundo',
    language: 'pt',
    creators: ['Iberê Thenório', 'Mari Fulfaro'],
    description:
      'Ciência caseira em português do Brasil: experimentos, oficinas, e a tese de que curiosidade não precisa de laboratório caro.',
    tags: ['brazil', 'science', 'diy', 'education'],
    genres: ['education', 'science'],
    region: 'latin-america',
    country: 'Brazil',
    countryCode: 'BR',
    urls: {
      youtube: 'https://www.youtube.com/@manualdomundo',
      website: 'https://www.manualdomundo.com.br/',
    },
    signals: { popularity: 86, diversity: 60 },
    english: {
      title: 'World Manual',
      description:
        'Kitchen-table science in Brazilian Portuguese: experiments, workshops, and the claim that curiosity does not need an expensive lab.',
    },
  }),
  youtube({
    id: 'en-pocas-palabras',
    title: 'En Pocas Palabras',
    language: 'es',
    creators: ['Kurzgesagt', 'Spanish collaborators'],
    description:
      'Ensayos animados en español sobre ciencia y futuro. Prueba de que el long-form no tiene que nacer en inglés.',
    tags: ['spanish', 'animation', 'science', 'explainer'],
    genres: ['education', 'science'],
    region: 'latin-america',
    country: 'Mexico',
    countryCode: 'MX',
    urls: {
      youtube: 'https://www.youtube.com/@enpocaspalabras',
    },
    signals: { popularity: 72, diversity: 68 },
    english: {
      title: 'In a Few Words',
      description:
        'Animated essays in Spanish on science and the future. Proof that long-form does not have to be born in English.',
    },
  }),
  youtube({
    id: 'aj-plus-ar',
    title: 'AJ+ عربي',
    language: 'ar',
    creators: ['AJ+'],
    description:
      'فيديو عربي قصير وطويل عن السياسات والحياة. منبر يوزع على المنصّات، لا على موجة FM.',
    tags: ['arabic', 'news', 'documentary', 'social'],
    genres: ['news', 'documentary'],
    region: 'arabia',
    country: 'Qatar',
    countryCode: 'QA',
    urls: {
      youtube: 'https://www.youtube.com/@ajplusarabi',
    },
    signals: { popularity: 77, diversity: 74 },
    english: {
      title: 'AJ+ Arabic',
      description:
        'Arabic short and long video on politics and ordinary life. A desk that distributes to platforms, not to an FM wave.',
    },
  }),
  youtube({
    id: 'cna-insider',
    title: 'CNA Insider',
    language: 'en',
    creators: ['CNA'],
    description:
      'Singaporean long-form on work, cities, and Southeast Asia. Public media that treats the region as a centre, not a colour piece.',
    tags: ['singapore', 'documentary', 'southeast-asia', 'work'],
    genres: ['documentary', 'society'],
    region: 'southeast-asia',
    country: 'Singapore',
    countryCode: 'SG',
    urls: {
      youtube: 'https://www.youtube.com/@CNAInsider',
    },
    signals: { popularity: 70, diversity: 72 },
    year: 2016,
  }),
  youtube({
    id: 'nhk-world',
    title: 'NHK WORLD-JAPAN',
    language: 'ja',
    creators: ['NHK'],
    description:
      '日本の公共放送が世界向けに出す映像：工芸、災害、地方。英語トラックもあるが、日本語の現場音が本体。',
    tags: ['japan', 'public-media', 'documentary', 'regions'],
    genres: ['documentary', 'culture'],
    region: 'east-asia',
    country: 'Japan',
    countryCode: 'JP',
    urls: {
      youtube: 'https://www.youtube.com/@NHKWORLDJAPAN',
      website: 'https://www3.nhk.or.jp/nhkworld/',
    },
    signals: { popularity: 73, diversity: 66 },
    english: {
      title: 'NHK WORLD-JAPAN',
      description:
        'Japan’s public broadcaster facing outward: crafts, disaster, the provinces. An English track exists; the Japanese field sound is the body.',
    },
  }),
  youtube({
    id: 'ted',
    title: 'TED',
    language: 'en',
    creators: ['TED'],
    description:
      'Talks that taught the internet a lecture format. Now a multilingual archive of ideas with uneven depth and enormous reach.',
    tags: ['talks', 'ideas', 'archive', 'global'],
    genres: ['education', 'ideas'],
    region: 'north-america',
    country: 'United States',
    countryCode: 'US',
    urls: {
      youtube: 'https://www.youtube.com/@TED',
      website: 'https://www.ted.com/',
    },
    signals: { popularity: 98, diversity: 45 },
    year: 2006,
  }),
  youtube({
    id: 'crashcourse',
    title: 'CrashCourse',
    language: 'en',
    creators: ['John Green', 'Hank Green', 'Complexly'],
    description:
      'Survey courses in history, literature, and science. A YouTube university that still assigns homework in the description.',
    tags: ['education', 'survey', 'history', 'science'],
    genres: ['education', 'history'],
    region: 'north-america',
    country: 'United States',
    countryCode: 'US',
    urls: {
      youtube: 'https://www.youtube.com/@crashcourse',
      website: 'https://thecrashcourse.com/',
    },
    signals: { popularity: 92, diversity: 35 },
    year: 2011,
  }),
  youtube({
    id: 'pbs-space-time',
    title: 'PBS Space Time',
    language: 'en',
    creators: ['Matthew O’Dowd', 'PBS Digital Studios'],
    description:
      'Physics lectures that do not apologise for the maths. Public media in a comment section.',
    tags: ['physics', 'space', 'lecture', 'public-media'],
    genres: ['science', 'education'],
    region: 'north-america',
    country: 'United States',
    countryCode: 'US',
    urls: {
      youtube: 'https://www.youtube.com/@pbsspacetime',
    },
    signals: { popularity: 79, diversity: 31 },
  }),
  youtube({
    id: 'the-wire-india',
    title: 'The Wire',
    language: 'en',
    creators: ['The Wire'],
    description:
      'Independent Indian video journalism: courts, campuses, elections. Long enough to show the document, not only the slogan.',
    tags: ['india', 'journalism', 'independent', 'politics'],
    genres: ['news', 'current-affairs'],
    region: 'india',
    country: 'India',
    countryCode: 'IN',
    urls: {
      youtube: 'https://www.youtube.com/@TheWireNews',
      website: 'https://thewire.in/',
    },
    signals: { popularity: 68, diversity: 69 },
  }),
  youtube({
    id: 'bbc-africa',
    title: 'BBC Africa',
    language: 'en',
    creators: ['BBC'],
    description:
      'Documentary and news video from across the continent. Still a London desk in the metadata; increasingly an African one in the field.',
    tags: ['africa', 'documentary', 'news', 'field'],
    genres: ['documentary', 'news'],
    region: 'west-africa',
    country: 'Kenya',
    countryCode: 'KE',
    urls: {
      youtube: 'https://www.youtube.com/@BBCNewsAfrica',
    },
    signals: { popularity: 75, diversity: 73 },
  }),
  youtube({
    id: 'al-jazeera-english',
    title: 'Al Jazeera English',
    language: 'en',
    creators: ['Al Jazeera'],
    description:
      'Long reports from a Doha newsroom that does not treat the Global South as a sidebar. Video that still believes in the correspondent.',
    tags: ['documentary', 'news', 'global-south', 'correspondent'],
    genres: ['news', 'documentary'],
    region: 'arabia',
    country: 'Qatar',
    countryCode: 'QA',
    urls: {
      youtube: 'https://www.youtube.com/@aljazeeraenglish',
      website: 'https://www.aljazeera.com/',
    },
    signals: { popularity: 87, diversity: 70 },
  }),
  youtube({
    id: 'numberphile',
    title: 'Numberphile',
    language: 'en',
    creators: ['Brady Haran'],
    description:
      'Mathematicians at a brown-paper table. A channel that treats a proof as something you can watch happen.',
    tags: ['mathematics', 'interview', 'education', 'uk'],
    genres: ['science', 'education'],
    region: 'uk-ireland',
    country: 'United Kingdom',
    countryCode: 'GB',
    urls: {
      youtube: 'https://www.youtube.com/@numberphile',
      website: 'https://www.numberphile.com/',
    },
    signals: { popularity: 81, diversity: 32 },
  }),
  youtube({
    id: 'school-of-life',
    title: 'The School of Life',
    language: 'en',
    creators: ['Alain de Botton', 'The School of Life'],
    description:
      'Short essays on love, work, and status anxiety. A London studio that made philosophy look like a product — and sometimes like a help.',
    tags: ['philosophy', 'essay', 'self', 'london'],
    genres: ['ideas', 'culture'],
    region: 'uk-ireland',
    country: 'United Kingdom',
    countryCode: 'GB',
    urls: {
      youtube: 'https://www.youtube.com/@theschooloflifetv',
      website: 'https://www.theschooloflife.com/',
    },
    signals: { popularity: 90, diversity: 28 },
  }),
  youtube({
    id: 'deshbhakt',
    title: 'The Deshbhakt',
    language: 'hi',
    creators: ['Akash Banerjee'],
    description:
      'हिंदी में व्यंग्य और राजनीति: लंबा मोनोलॉग, अख़बार की गति से धीमा। यूट्यूब को स्टूडियो मानने वाली भारतीय आवाज़।',
    tags: ['hindi', 'politics', 'satire', 'monologue'],
    genres: ['current-affairs', 'culture'],
    region: 'india',
    country: 'India',
    countryCode: 'IN',
    urls: {
      youtube: 'https://www.youtube.com/@TheDeshbhakt',
    },
    signals: { popularity: 71, diversity: 80 },
    english: {
      title: 'The Deshbhakt',
      description:
        'Satire and politics in Hindi: a long monologue, slower than the news cycle. An Indian voice that treats YouTube as a studio.',
    },
  }),
  youtube({
    id: 'vortex-arte',
    title: 'Le Vortex',
    language: 'fr',
    creators: ['e-penser', 'DirtyBiology', 'others'],
    description:
      'Collectif scientifique francophone: biologie, physique, esprit critique. YouTube comme campus, pas comme extrait.',
    tags: ['france', 'science', 'collective', 'education'],
    genres: ['science', 'education'],
    region: 'western-europe',
    country: 'France',
    countryCode: 'FR',
    urls: {
      youtube: 'https://www.youtube.com/@LeVortexOff',
    },
    signals: { popularity: 64, diversity: 58 },
    english: {
      title: 'The Vortex',
      description:
        'A French-speaking science collective: biology, physics, scepticism. YouTube as a campus, not a clip.',
    },
  }),
  youtube({
    id: 'african-facts',
    title: 'Get.factual / African documentary desks',
    language: 'en',
    creators: ['Various African documentary makers'],
    description:
      'A shelf for long African documentary on YouTube: cities, music, extraction, return. Indexed here as a type, not a single channel.',
    tags: ['africa', 'documentary', 'cities', 'music'],
    genres: ['documentary', 'culture'],
    region: 'west-africa',
    country: 'Ghana',
    countryCode: 'GH',
    urls: {
      youtube:
        'https://www.youtube.com/results?search_query=african+documentary+longform',
    },
    signals: { popularity: 38, diversity: 92 },
  }),
  youtube({
    id: 'thai-the-standard',
    title: 'The Standard',
    language: 'th',
    creators: ['The Standard'],
    description:
      'ข่าวและสารคดีภาษาไทยแบบยาว: การเมือง, เมือง, เสียงที่ไม่อยากเป็นคลิปสั้น.',
    tags: ['thai', 'news', 'documentary', 'bangkok'],
    genres: ['news', 'culture'],
    region: 'southeast-asia',
    country: 'Thailand',
    countryCode: 'TH',
    urls: {
      youtube: 'https://www.youtube.com/@TheStandardNews',
      website: 'https://thestandard.co/',
    },
    signals: { popularity: 63, diversity: 83 },
    english: {
      title: 'The Standard',
      description:
        'Long-form Thai news and documentary: politics, the city, a voice that refuses to become a short clip.',
    },
  }),
  youtube({
    id: 'tv-peru-quechua',
    title: 'Ñuqanchik (video)',
    language: 'qu',
    creators: ['TV Perú'],
    description:
      'Noticiero en runasimi también en video. La misma lengua del podcast, otra puerta de archivo.',
    tags: ['quechua', 'news', 'andes', 'public-media'],
    genres: ['news', 'culture'],
    region: 'andes',
    country: 'Peru',
    countryCode: 'PE',
    urls: {
      youtube: 'https://www.youtube.com/@tvperuoficial',
    },
    signals: { popularity: 30, diversity: 98 },
    english: {
      title: 'Ñuqanchik (video)',
      description:
        'A Quechua newscast that also lives as video. The same language as the radio desk, another door into the archive.',
    },
  }),
];
