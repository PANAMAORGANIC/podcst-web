import { podcast } from './helpers';

export const PODCASTS = [
  podcast({
    id: 'this-american-life',
    title: 'This American Life',
    language: 'en',
    creators: ['Ira Glass', 'WHYY'],
    description:
      'Long-form documentary radio that treats ordinary American life as something worth sitting with. A weekly magazine of true stories, reported and arranged around a theme.',
    tags: ['documentary', 'narrative', 'public-radio', 'weekly'],
    genres: ['journalism', 'storytelling'],
    region: 'north-america',
    country: 'United States',
    countryCode: 'US',
    urls: {
      rss: 'https://www.thisamericanlife.org/podcast/rss.xml',
      website: 'https://www.thisamericanlife.org/',
    },
    signals: { popularity: 96, diversity: 28 },
    episodeCount: 800,
    year: 1995,
  }),
  podcast({
    id: 'radio-ambulante',
    title: 'Radio Ambulante',
    language: 'es',
    creators: ['Daniel Alarcón', 'Radio Ambulante Estudios'],
    description:
      'Crónicas latinoamericanas en español: reportajes narrativos que cruzan fronteras, acentos y archivos familiares. Un mapa sonoro de las Américas.',
    tags: ['crónica', 'latam', 'narrative', 'spanish'],
    genres: ['journalism', 'storytelling'],
    region: 'latin-america',
    country: 'United States / Latin America',
    countryCode: 'US',
    urls: {
      rss: 'https://feeds.npr.org/510310/podcast.xml',
      website: 'https://radioambulante.org/',
    },
    signals: { popularity: 74, diversity: 78 },
    episodeCount: 250,
    year: 2012,
    english: {
      title: 'Radio Ambulante',
      description:
        'Latin American narrative journalism in Spanish: reported stories that cross borders, accents, and family archives. A sonic map of the Americas.',
    },
  }),
  podcast({
    id: 'el-hilo',
    title: 'El hilo',
    language: 'es',
    creators: ['Radio Ambulante Estudios'],
    description:
      'Un podcast diario de noticias de América Latina. Contexto, no titular: cada episodio desenreda un tema que mueve la región.',
    tags: ['news', 'daily', 'latam', 'context'],
    genres: ['news', 'current-affairs'],
    region: 'latin-america',
    country: 'United States / Latin America',
    countryCode: 'US',
    urls: {
      website: 'https://elhilo.audio/',
    },
    signals: { popularity: 68, diversity: 76 },
    year: 2020,
    english: {
      title: 'The Thread',
      description:
        'A Latin American news podcast that prefers context to headlines. Each episode unpicks one story moving the region.',
    },
  }),
  podcast({
    id: 'the-seen-and-the-unseen',
    title: 'The Seen and the Unseen',
    language: 'en',
    creators: ['Amit Varma'],
    description:
      'Long conversations about India: economics, history, literature, and the unseen rules that shape public life. Often three hours, never rushed.',
    tags: ['india', 'conversation', 'economics', 'longform'],
    genres: ['ideas', 'society'],
    region: 'india',
    country: 'India',
    countryCode: 'IN',
    urls: {
      website: 'https://seenunseen.in/',
      rss: 'https://seenunseen.in/feed/podcast/',
    },
    signals: { popularity: 62, diversity: 70 },
    episodeCount: 400,
    year: 2017,
  }),
  podcast({
    id: 'story-fm',
    title: '故事FM',
    language: 'zh',
    creators: ['故事FM'],
    description:
      '普通人的第一人称故事。中国各地的声音：搬家、告别、夜班、童年、以及那些通常不会写成新闻的生活。',
    tags: ['first-person', 'china', 'oral-history', 'narrative'],
    genres: ['storytelling', 'society'],
    region: 'east-asia',
    country: 'China',
    countryCode: 'CN',
    urls: {
      website: 'https://storyfm.cn/',
    },
    signals: { popularity: 71, diversity: 80 },
    year: 2017,
    english: {
      title: 'Story FM',
      description:
        'First-person stories from ordinary people across China: moving house, farewells, night shifts, childhood, and lives that rarely become news.',
    },
  }),
  podcast({
    id: 'cafe-brasil',
    title: 'Café Brasil',
    language: 'pt',
    creators: ['Luciano Pires'],
    description:
      'Ensaios em áudio sobre liberdade, trabalho, cultura brasileira e o hábito de pensar por conta própria. Um café longo, sem pressa de consenso.',
    tags: ['essay', 'brazil', 'ideas', 'liberty'],
    genres: ['ideas', 'culture'],
    region: 'latin-america',
    country: 'Brazil',
    countryCode: 'BR',
    urls: {
      website: 'https://portalcafebrasil.com.br/',
    },
    signals: { popularity: 64, diversity: 66 },
    year: 2008,
    english: {
      title: 'Café Brasil',
      description:
        'Audio essays on liberty, work, Brazilian culture, and the habit of thinking for yourself. A long coffee, in no hurry to agree.',
    },
  }),
  podcast({
    id: 'nerdcast',
    title: 'Nerdcast',
    language: 'pt',
    creators: ['Jovem Nerd'],
    description:
      'Mesa-redonda brasileira sobre quadrinhos, ciência, história e cultura pop. Um dos podcasts mais longevos da língua portuguesa.',
    tags: ['pop-culture', 'brazil', 'ensemble', 'science'],
    genres: ['culture', 'entertainment'],
    region: 'latin-america',
    country: 'Brazil',
    countryCode: 'BR',
    urls: {
      website: 'https://jovemnerd.com.br/nerdcast/',
      rss: 'https://jovemnerd.com.br/feed-nerdcast/',
    },
    signals: { popularity: 82, diversity: 54 },
    year: 2006,
    english: {
      title: 'Nerdcast',
      description:
        'A Brazilian roundtable on comics, science, history, and pop culture. One of the longest-running podcasts in Portuguese.',
    },
  }),
  podcast({
    id: 'sowt-al-rumman',
    title: 'الرمان',
    language: 'ar',
    creators: ['Sowt'],
    description:
      'بودكاست سردي من صوت يستكشف الحياة في العالم العربي: ذاكرة، مدن، هجرة، وتفاصيل لا تتسع لها النشرة.',
    tags: ['narrative', 'arabic', 'cities', 'memory'],
    genres: ['storytelling', 'culture'],
    region: 'levant',
    country: 'Jordan',
    countryCode: 'JO',
    urls: {
      website: 'https://sowt.com/',
    },
    signals: { popularity: 48, diversity: 88 },
    year: 2016,
    english: {
      title: 'The Pomegranate',
      description:
        'A narrative podcast from Sowt exploring life in the Arabic-speaking world: memory, cities, migration, and details that never fit a bulletin.',
    },
  }),
  podcast({
    id: 'bbc-hausa-raayi',
    title: "Ra'ayi",
    language: 'ha',
    creators: ['BBC Hausa'],
    description:
      "Shirin BBC Hausa na muhawara da nazarin labarai a Sahel. Muryoyin Najeriya, Nijar, da yankin Hausa a kan siyasa, al'adu, da rayuwa ta yau da kullum.",
    tags: ['hausa', 'sahel', 'news', 'debate'],
    genres: ['news', 'current-affairs'],
    region: 'sahel',
    country: 'Nigeria',
    countryCode: 'NG',
    urls: {
      website: 'https://www.bbc.com/hausa',
    },
    signals: { popularity: 44, diversity: 94 },
    english: {
      title: 'Opinion',
      description:
        'BBC Hausa debate and news analysis from the Sahel. Voices from Nigeria, Niger, and the Hausa-speaking world on politics, culture, and daily life.',
    },
  }),
  podcast({
    id: 'unreserved',
    title: 'Unreserved',
    language: 'en',
    creators: ['Rosanna Deerchild', 'CBC'],
    description:
      'Indigenous voices from across what is now Canada: music, language revival, land, humour, and the work of telling our own stories.',
    tags: ['indigenous', 'canada', 'language', 'arts'],
    genres: ['culture', 'society'],
    region: 'north-america',
    country: 'Canada',
    countryCode: 'CA',
    urls: {
      website: 'https://www.cbc.ca/listen/cbc-podcasts/132-unreserved',
      rss: 'https://www.cbc.ca/podcasting/includes/unreserved.xml',
    },
    signals: { popularity: 51, diversity: 90 },
    year: 2014,
  }),
  podcast({
    id: 'rnz-waiata-anthems',
    title: 'Waiata / Anthems',
    language: 'mi',
    creators: ['RNZ', 'Te Reo Māori artists'],
    description:
      'Waiata Māori and bilingual conversations from Aotearoa. Language on the air as a living practice, not a museum label.',
    tags: ['maori', 'aotearoa', 'music', 'language'],
    genres: ['music', 'culture'],
    region: 'oceania',
    country: 'New Zealand',
    countryCode: 'NZ',
    urls: {
      website: 'https://www.rnz.co.nz/',
    },
    signals: { popularity: 36, diversity: 96 },
    english: {
      title: 'Waiata / Anthems',
      description:
        'Māori song and bilingual conversation from Aotearoa. Language on the air as a living practice, not a museum label.',
    },
  }),
  podcast({
    id: 'vietcetera',
    title: 'Vietnam Innovators',
    language: 'vi',
    creators: ['Vietcetera'],
    description:
      'Phỏng vấn tiếng Việt với người sáng lập, nhà thiết kế và người làm văn hóa tại Việt Nam. Bản đồ âm thanh của một thế hệ đang đổi nhịp Sài Gòn và Hà Nội.',
    tags: ['vietnam', 'founders', 'cities', 'interview'],
    genres: ['business', 'culture'],
    region: 'southeast-asia',
    country: 'Vietnam',
    countryCode: 'VN',
    urls: {
      website: 'https://vietcetera.com/',
    },
    signals: { popularity: 49, diversity: 82 },
    english: {
      title: 'Vietnam Innovators',
      description:
        'Vietnamese-language interviews with founders, designers, and cultural workers in Vietnam. A sound map of a generation changing the tempo of Saigon and Hanoi.',
    },
  }),
  podcast({
    id: 'endgame-id',
    title: 'Endgame',
    language: 'id',
    creators: ['Gita Wirjawan'],
    description:
      'Percakapan panjang berbahasa Indonesia tentang geopolitik, pendidikan, dan masa depan Asia Tenggara. Tamu dari kampus, kabinet, dan laboratorium.',
    tags: ['indonesia', 'geopolitics', 'education', 'longform'],
    genres: ['ideas', 'current-affairs'],
    region: 'southeast-asia',
    country: 'Indonesia',
    countryCode: 'ID',
    urls: {
      website: 'https://www.endgame.id/',
      youtube: 'https://www.youtube.com/@endgame_id',
    },
    signals: { popularity: 67, diversity: 74 },
    year: 2020,
    english: {
      title: 'Endgame',
      description:
        'Long Indonesian-language conversations on geopolitics, education, and the future of Southeast Asia. Guests from campuses, cabinets, and labs.',
    },
  }),
  podcast({
    id: 'p3-dokumentar',
    title: 'P3 Dokumentär',
    language: 'sv',
    creators: ['Sveriges Radio'],
    description:
      'Svensk dokumentärpodcast som gräver i kriminalfall, subkulturer och nationella minnen. Public service när den är som mest tålmodig.',
    tags: ['documentary', 'sweden', 'true-crime', 'public-service'],
    genres: ['documentary', 'journalism'],
    region: 'nordic',
    country: 'Sweden',
    countryCode: 'SE',
    urls: {
      website: 'https://sverigesradio.se/p3dokumentar',
    },
    signals: { popularity: 72, diversity: 58 },
    english: {
      title: 'P3 Documentary',
      description:
        'A Swedish documentary podcast that digs into crimes, subcultures, and national memory. Public service at its most patient.',
    },
  }),
  podcast({
    id: 'lsd-france-culture',
    title: 'LSD, La série documentaire',
    language: 'fr',
    creators: ['France Culture'],
    description:
      'Documentaires radiophoniques en plusieurs épisodes: travail, corps, archives coloniales, sciences. La radio publique française au format long.',
    tags: ['documentary', 'france', 'series', 'public-radio'],
    genres: ['documentary', 'ideas'],
    region: 'western-europe',
    country: 'France',
    countryCode: 'FR',
    urls: {
      website:
        'https://www.radiofrance.fr/franceculture/podcasts/lsd-la-serie-documentaire',
    },
    signals: { popularity: 58, diversity: 60 },
    english: {
      title: 'LSD, the documentary series',
      description:
        'Multi-episode radio documentaries on work, the body, colonial archives, and science. French public radio in long form.',
    },
  }),
  podcast({
    id: 'dlf-kultur-feature',
    title: 'Feature',
    language: 'de',
    creators: ['Deutschlandfunk Kultur'],
    description:
      'Hörspiele und Features des deutschen öffentlich-rechtlichen Rundfunks: Recherche, Collage, Stimmen aus Archiv und Gegenwart.',
    tags: ['feature', 'germany', 'public-radio', 'archive'],
    genres: ['documentary', 'arts'],
    region: 'central-europe',
    country: 'Germany',
    countryCode: 'DE',
    urls: {
      website: 'https://www.deutschlandfunkkultur.de/',
    },
    signals: { popularity: 55, diversity: 57 },
    english: {
      title: 'Feature',
      description:
        'Radio features from German public broadcasting: reporting, collage, and voices from archive and present.',
    },
  }),
  podcast({
    id: 'kan-mabat-sheni',
    title: 'מבט שני',
    language: 'he',
    creators: ['Kan'],
    description:
      'פודקאסט תחקירים של כאן: פוליטיקה, חברה וזיכרון בישראל. עיתונות ארוכה בעברית, בלי קיצור דרך.',
    tags: ['investigative', 'israel', 'hebrew', 'public-media'],
    genres: ['journalism', 'current-affairs'],
    region: 'levant',
    country: 'Israel',
    countryCode: 'IL',
    urls: {
      website: 'https://www.kan.org.il/',
    },
    signals: { popularity: 47, diversity: 72 },
    english: {
      title: 'A Second Look',
      description:
        'Investigative audio from Kan: politics, society, and memory in Israel. Long-form journalism in Hebrew, without shortcuts.',
    },
  }),
  podcast({
    id: 'the-naked-pravda',
    title: 'The Naked Pravda',
    language: 'en',
    creators: ['Meduza'],
    description:
      'English-language reporting from Meduza on Russia, exile media, and the war’s wider shockwaves. Independent journalism under pressure.',
    tags: ['russia', 'exile-media', 'politics', 'independent'],
    genres: ['news', 'current-affairs'],
    region: 'eastern-europe',
    country: 'Latvia',
    countryCode: 'LV',
    urls: {
      website: 'https://meduza.io/en',
    },
    signals: { popularity: 53, diversity: 71 },
    year: 2018,
  }),
  podcast({
    id: 'howie-severino',
    title: 'The Howie Severino Podcast',
    language: 'tl',
    creators: ['Howie Severino'],
    description:
      'Usapang Filipino tungkol sa kasaysayan, pamamahayag, at alaala ng EDSA hanggang sa mga lalawigan. Isang reporter na hindi nagmamadali.',
    tags: ['philippines', 'history', 'journalism', 'filipino'],
    genres: ['journalism', 'history'],
    region: 'southeast-asia',
    country: 'Philippines',
    countryCode: 'PH',
    urls: {
      website: 'https://www.gmanetwork.com/',
    },
    signals: { popularity: 46, diversity: 84 },
    english: {
      title: 'The Howie Severino Podcast',
      description:
        'Filipino-language conversations on history, reporting, and memory from EDSA to the provinces. A reporter in no hurry.',
    },
  }),
  podcast({
    id: 'philosophize-this',
    title: 'Philosophize This!',
    language: 'en',
    creators: ['Stephen West'],
    description:
      'A free, chronological tour of Western and increasingly global philosophy, explained without the seminar-room gatekeeping.',
    tags: ['philosophy', 'education', 'history-of-ideas'],
    genres: ['education', 'ideas'],
    region: 'north-america',
    country: 'United States',
    countryCode: 'US',
    urls: {
      website: 'https://www.philosophizethis.org/',
      rss: 'https://feed.philosophizethis.org/',
    },
    signals: { popularity: 80, diversity: 34 },
    year: 2013,
  }),
  podcast({
    id: '99-percent-invisible',
    title: '99% Invisible',
    language: 'en',
    creators: ['Roman Mars'],
    description:
      'Design that usually goes unnoticed: infrastructure, signage, architecture, and the politics hiding in ordinary objects.',
    tags: ['design', 'architecture', 'cities', 'narrative'],
    genres: ['design', 'storytelling'],
    region: 'north-america',
    country: 'United States',
    countryCode: 'US',
    urls: {
      website: 'https://99percentinvisible.org/',
      rss: 'https://feeds.simplecast.com/BqbsxVfO',
    },
    signals: { popularity: 90, diversity: 30 },
    year: 2010,
  }),
  podcast({
    id: 'medyascope-radyo',
    title: 'Medyascope Radyo',
    language: 'tr',
    creators: ['Medyascope'],
    description:
      'Bağımsız Türkçe habercilik: siyaset, yerel gazetecilik ve sürgündeki medya pratikleri. Podcast olarak arşivlenen günlük yayın.',
    tags: ['turkey', 'independent', 'news', 'archive'],
    genres: ['news', 'current-affairs'],
    region: 'western-europe',
    country: 'Turkey',
    countryCode: 'TR',
    urls: {
      website: 'https://medyascope.tv/',
    },
    signals: { popularity: 50, diversity: 75 },
    english: {
      title: 'Medyascope Radio',
      description:
        'Independent Turkish journalism: politics, local reporting, and media practice under pressure. Daily broadcasts archived as a podcast.',
    },
  }),
  podcast({
    id: 'bbc-persian-donya',
    title: 'دنیای بی‌بی‌سی',
    language: 'fa',
    creators: ['BBC Persian'],
    description:
      'گزارش‌ها و گفتگوهای فارسی درباره ایران، افغانستان و دیاسپورا. رسانه‌ای در تبعید که هنوز به آرشیو شفاهی منطقه متکی است.',
    tags: ['persian', 'iran', 'diaspora', 'news'],
    genres: ['news', 'culture'],
    region: 'persianate',
    country: 'United Kingdom',
    countryCode: 'GB',
    urls: {
      website: 'https://www.bbc.com/persian',
    },
    signals: { popularity: 52, diversity: 86 },
    english: {
      title: 'BBC Persian World',
      description:
        'Persian-language reporting and conversation on Iran, Afghanistan, and the diaspora. Exile media that still leans on the region’s oral archive.',
    },
  }),
  podcast({
    id: 'voa-amharic',
    title: 'የአሜሪካ ድምፅ',
    language: 'am',
    creators: ['VOA Amharic'],
    description:
      'የአማርኛ ዜናና ትንተና ከኢትዮጵያ፣ ቀንድ አፍሪካ እና ስደተኛ ማህበረሰቦች። የኤተር ላይ የቋንቋ መዝገብ።',
    tags: ['amharic', 'ethiopia', 'news', 'horn'],
    genres: ['news', 'current-affairs'],
    region: 'horn-of-africa',
    country: 'Ethiopia',
    countryCode: 'ET',
    urls: {
      website: 'https://amharic.voanews.com/',
    },
    signals: { popularity: 38, diversity: 95 },
    english: {
      title: 'Voice of America Amharic',
      description:
        'Amharic news and analysis from Ethiopia, the Horn of Africa, and diaspora communities. A language archive on the air.',
    },
  }),
  podcast({
    id: 'bbc-bengali-global',
    title: 'বিবিসি বাংলা',
    language: 'bn',
    creators: ['BBC Bangla'],
    description:
      'বাংলা ভাষায় সংবাদ ও আলোচনা: বাংলাদেশ, পশ্চিমবঙ্গ এবং প্রবাসী বাঙালি জীবন। দক্ষিণ এশিয়ার অন্যতম বৃহৎ কথ্য আর্কাইভ।',
    tags: ['bengali', 'bangladesh', 'news', 'diaspora'],
    genres: ['news', 'culture'],
    region: 'india',
    country: 'Bangladesh',
    countryCode: 'BD',
    urls: {
      website: 'https://www.bbc.com/bengali',
    },
    signals: { popularity: 56, diversity: 89 },
    english: {
      title: 'BBC Bangla',
      description:
        'News and conversation in Bengali from Bangladesh, West Bengal, and the Bengali diaspora. One of South Asia’s largest spoken archives.',
    },
  }),
  podcast({
    id: 'the-hindu-tamil',
    title: 'தி இந்து தமிழ்',
    language: 'ta',
    creators: ['The Hindu Tamil'],
    description:
      'தமிழில் அரசியல், இலக்கியம், அறிவியல் உரையாடல்கள். சென்னை முதல் யாழ்ப்பாணம் வரை ஒரு மொழி வலையமைப்பு.',
    tags: ['tamil', 'literature', 'politics', 'south-india'],
    genres: ['news', 'culture'],
    region: 'india',
    country: 'India',
    countryCode: 'IN',
    urls: {
      website: 'https://www.hindutamil.in/',
    },
    signals: { popularity: 42, diversity: 91 },
    english: {
      title: 'The Hindu Tamil',
      description:
        'Politics, literature, and science conversations in Tamil. A language network from Chennai to Jaffna.',
    },
  }),
  podcast({
    id: 'kimyoungha-books',
    title: '김영하의 책 읽는 시간',
    language: 'ko',
    creators: ['김영하'],
    description:
      '소설가 김영하가 책을 읽는 방식에 대해 이야기한다. 한국 문학, 번역, 그리고 혼자 읽는 일의 리듬.',
    tags: ['korea', 'literature', 'reading', 'author'],
    genres: ['literature', 'culture'],
    region: 'east-asia',
    country: 'South Korea',
    countryCode: 'KR',
    urls: {
      website: 'https://www.podbbang.com/',
    },
    signals: { popularity: 54, diversity: 73 },
    english: {
      title: "Kim Young-ha's Reading Hour",
      description:
        'Novelist Kim Young-ha on how to read. Korean literature, translation, and the rhythm of reading alone.',
    },
  }),
  podcast({
    id: 'hibiki-bunka',
    title: '文化放送ポッドキャスト',
    language: 'ja',
    creators: ['文化放送'],
    description:
      '東京のラジオ文化をポッドキャストへ。トーク、演芸、深夜の声。日本語の放送ことばがアーカイブになる場所。',
    tags: ['japan', 'radio', 'talk', 'tokyo'],
    genres: ['culture', 'entertainment'],
    region: 'east-asia',
    country: 'Japan',
    countryCode: 'JP',
    urls: {
      website: 'https://www.joqr.co.jp/',
    },
    signals: { popularity: 57, diversity: 68 },
    english: {
      title: 'Bunka Hoso Podcasts',
      description:
        'Tokyo radio culture, recast as podcasts: talk, performance, late-night voices. Where broadcast Japanese becomes an archive.',
    },
  }),
  podcast({
    id: 'raport-o-stanie-swiata',
    title: 'Raport o stanie świata',
    language: 'pl',
    creators: ['Dariusz Rosiak'],
    description:
      'Polski podcast międzynarodowy: reporterzy z Afryki, Azji i Ameryk. Tygodniowy briefing, który nie zaczyna się w Warszawie.',
    tags: ['poland', 'international', 'reporting', 'weekly'],
    genres: ['news', 'journalism'],
    region: 'central-europe',
    country: 'Poland',
    countryCode: 'PL',
    urls: {
      website: 'https://www.raportostanieswiata.pl/',
    },
    signals: { popularity: 59, diversity: 64 },
    english: {
      title: 'Report on the State of the World',
      description:
        'A Polish international-affairs podcast: reporters from Africa, Asia, and the Americas. A weekly briefing that does not start in Warsaw.',
    },
  }),
  podcast({
    id: 'recorder-ro',
    title: 'Recorder',
    language: 'ro',
    creators: ['Recorder'],
    description:
      'Jurnalism de investigație în română, adesea însoțit de documentar video. Stat, sănătate, justiție — fără grabă de platou.',
    tags: ['romania', 'investigative', 'documentary', 'independent'],
    genres: ['journalism', 'documentary'],
    region: 'eastern-europe',
    country: 'Romania',
    countryCode: 'RO',
    urls: {
      website: 'https://recorder.ro/',
      youtube: 'https://www.youtube.com/@recorderro',
    },
    signals: { popularity: 48, diversity: 77 },
    english: {
      title: 'Recorder',
      description:
        'Investigative journalism in Romanian, often paired with video documentary. State, health, justice — without studio hurry.',
    },
  }),
  podcast({
    id: 'partizan-hangok',
    title: 'Partizán',
    language: 'hu',
    creators: ['Partizán'],
    description:
      'Független magyar beszélgetések politikáról, kultúráról és a nyilvánosság állapotáról. Hosszú adások, kevés smink.',
    tags: ['hungary', 'independent', 'politics', 'longform'],
    genres: ['current-affairs', 'culture'],
    region: 'central-europe',
    country: 'Hungary',
    countryCode: 'HU',
    urls: {
      website: 'https://www.partizanmedia.hu/',
      youtube: 'https://www.youtube.com/@PartizanMedia',
    },
    signals: { popularity: 51, diversity: 76 },
    english: {
      title: 'Partizán',
      description:
        'Independent Hungarian conversations on politics, culture, and the state of the public sphere. Long episodes, little makeup.',
    },
  }),
  podcast({
    id: 'yle-radio-suomi',
    title: 'Yle Radio Suomi',
    language: 'fi',
    creators: ['Yle'],
    description:
      'Suomenkielistä julkista radiota podcasteina: alueiden äänet, kirjallisuus, ja arjen dokumentit. Pieni kielialue, suuri arkisto.',
    tags: ['finland', 'public-radio', 'regions', 'finnish'],
    genres: ['culture', 'news'],
    region: 'nordic',
    country: 'Finland',
    countryCode: 'FI',
    urls: {
      website: 'https://areena.yle.fi/podcastit',
    },
    signals: { popularity: 45, diversity: 79 },
    english: {
      title: 'Yle Radio Suomi',
      description:
        'Finnish-language public radio as podcasts: regional voices, literature, and everyday documents. A small language area, a large archive.',
    },
  }),
  podcast({
    id: 'nrk-ekko',
    title: 'Ekko',
    language: 'no',
    creators: ['NRK'],
    description:
      'Norsk samfunnsmagasin: forskning, etikk og hverdag. Public service på bokmål og nynorsk, uten å jage klipp.',
    tags: ['norway', 'society', 'science', 'public-service'],
    genres: ['ideas', 'society'],
    region: 'nordic',
    country: 'Norway',
    countryCode: 'NO',
    urls: {
      website: 'https://radio.nrk.no/',
    },
    signals: { popularity: 50, diversity: 69 },
    english: {
      title: 'Ekko',
      description:
        'A Norwegian society magazine: research, ethics, and ordinary days. Public service in Bokmål and Nynorsk, not chasing clips.',
    },
  }),
  podcast({
    id: 'bbc-swahili-dira',
    title: 'Dira ya Dunia',
    language: 'sw',
    creators: ['BBC Swahili'],
    description:
      'Habari na uchambuzi kwa Kiswahili kutoka Afrika Mashariki na bahari ya Hindi. Lugha ya biashara na mashairi kwenye mawimbi.',
    tags: ['swahili', 'east-africa', 'news', 'indian-ocean'],
    genres: ['news', 'current-affairs'],
    region: 'east-africa',
    country: 'Kenya',
    countryCode: 'KE',
    urls: {
      website: 'https://www.bbc.com/swahili',
    },
    signals: { popularity: 53, diversity: 92 },
    english: {
      title: "The World's Compass",
      description:
        'News and analysis in Swahili from East Africa and the Indian Ocean. A language of trade and poetry, on the air.',
    },
  }),
  podcast({
    id: 'sabc-ukhozi',
    title: 'Ukhozi FM',
    language: 'zu',
    creators: ['SABC'],
    description:
      'Umsakazo wesiZulu ovela eNingizimu Afrika: umculo, izindaba, nezingxoxo zomphakathi. Enye yeziteshi ezinkulu kakhulu e-Afrika.',
    tags: ['zulu', 'south-africa', 'radio', 'music'],
    genres: ['culture', 'music'],
    region: 'southern-africa',
    country: 'South Africa',
    countryCode: 'ZA',
    urls: {
      website: 'https://www.ukhozifm.co.za/',
    },
    signals: { popularity: 60, diversity: 93 },
    english: {
      title: 'Ukhozi FM',
      description:
        'Zulu-language radio from South Africa: music, news, and community conversation. One of the largest stations on the continent.',
    },
  }),
  podcast({
    id: 'rpp-quechua',
    title: 'Ñuqanchik',
    language: 'qu',
    creators: ['TV Perú', 'RPP'],
    description:
      'Willaykuna runasimipi: Peru, Andes, llaqtakuna. Simi kawsachisqa radio chawpipi, mana museo rikipi.',
    tags: ['quechua', 'andes', 'news', 'indigenous'],
    genres: ['news', 'culture'],
    region: 'andes',
    country: 'Peru',
    countryCode: 'PE',
    urls: {
      website: 'https://www.tvperu.gob.pe/',
    },
    signals: { popularity: 33, diversity: 98 },
    english: {
      title: 'Ñuqanchik',
      description:
        'News in Quechua from Peru and the Andes. A living language in the middle of the broadcast day, not in a museum case.',
    },
  }),
  podcast({
    id: 'suspilne-podcasts',
    title: 'Суспільне Подкасти',
    language: 'uk',
    creators: ['Суспільне'],
    description:
      'Українське суспільне мовлення: війна, культура, регіональні голоси. Архів, який збирають під обстрілами.',
    tags: ['ukraine', 'public-media', 'war', 'culture'],
    genres: ['news', 'culture'],
    region: 'eastern-europe',
    country: 'Ukraine',
    countryCode: 'UA',
    urls: {
      website: 'https://suspilne.media/',
    },
    signals: { popularity: 58, diversity: 81 },
    english: {
      title: 'Suspilne Podcasts',
      description:
        'Ukrainian public broadcasting: war, culture, regional voices. An archive gathered under fire.',
    },
  }),
  podcast({
    id: 'bbc-nepali',
    title: 'बीबीसी नेपाली',
    language: 'ne',
    creators: ['BBC Nepali'],
    description:
      'नेपाली भाषामा समाचार र छलफल: काठमाडौं, पहाड, तराई र प्रवासी जीवन। हिमालयको मौखिक अभिलेख।',
    tags: ['nepali', 'himalaya', 'news', 'diaspora'],
    genres: ['news', 'culture'],
    region: 'india',
    country: 'Nepal',
    countryCode: 'NP',
    urls: {
      website: 'https://www.bbc.com/nepali',
    },
    signals: { popularity: 41, diversity: 90 },
    english: {
      title: 'BBC Nepali',
      description:
        'News and discussion in Nepali from Kathmandu, the hills, the Tarai, and the diaspora. An oral record of the Himalaya.',
    },
  }),
  podcast({
    id: 'voa-khmer',
    title: 'វីអូអេ ខ្មែរ',
    language: 'km',
    creators: ['VOA Khmer'],
    description:
      'Khmer-language news: history, politics, and daily life in Cambodia.',
    tags: ['khmer', 'cambodia', 'news', 'memory'],
    genres: ['news', 'history'],
    region: 'southeast-asia',
    country: 'Cambodia',
    countryCode: 'KH',
    urls: {
      website: 'https://khmer.voanews.com/',
    },
    signals: { popularity: 35, diversity: 97 },
    english: {
      title: 'VOA Khmer',
      description:
        'News in Khmer: history, politics, and daily life in Cambodia. A sound archive of a language that was once targeted for erasure.',
    },
  }),
  podcast({
    id: 'bfm-evening-edition',
    title: 'Evening Edition',
    language: 'ms',
    creators: ['BFM 89.9'],
    description:
      'Berita dan perbualan dwibahasa dari Kuala Lumpur: ekonomi, bandar, dan politik Malaysia. Radio komersial yang masih dengar lama.',
    tags: ['malaysia', 'bilingual', 'news', 'kuala-lumpur'],
    genres: ['news', 'business'],
    region: 'southeast-asia',
    country: 'Malaysia',
    countryCode: 'MY',
    urls: {
      website: 'https://www.bfm.my/',
    },
    signals: { popularity: 47, diversity: 80 },
    english: {
      title: 'Evening Edition',
      description:
        'Bilingual news and conversation from Kuala Lumpur: economy, the city, and Malaysian politics. Commercial radio that still listens at length.',
    },
  }),
  podcast({
    id: 'bbc-urdu-sairbeen',
    title: 'سائر بین',
    language: 'ur',
    creators: ['BBC Urdu'],
    description:
      'اردو میں خبریں اور فیچر: پاکستان، ہندوستان اور خلیج۔ ایک زبان جو سرحدوں کو کاٹتی ہے، نشریات میں محفوظ۔',
    tags: ['urdu', 'pakistan', 'news', 'feature'],
    genres: ['news', 'culture'],
    region: 'india',
    country: 'Pakistan',
    countryCode: 'PK',
    urls: {
      website: 'https://www.bbc.com/urdu',
    },
    signals: { popularity: 55, diversity: 87 },
    english: {
      title: 'Sairbeen',
      description:
        'News and features in Urdu from Pakistan, India, and the Gulf. A language that cuts across borders, kept on the air.',
    },
  }),
  podcast({
    id: 'bbc-yoruba',
    title: 'BBC Yorùbá',
    language: 'yo',
    creators: ['BBC Yoruba'],
    description:
      'Ìròyìn àti ìjíròrò ní èdè Yorùbá: Nàìjíríà, Benin, Togo, àti àwọn ọmọ àtìlẹhìn. Èdè tí ó ní òwe, lórí rédíò.',
    tags: ['yoruba', 'nigeria', 'news', 'proverbs'],
    genres: ['news', 'culture'],
    region: 'west-africa',
    country: 'Nigeria',
    countryCode: 'NG',
    urls: {
      website: 'https://www.bbc.com/yoruba',
    },
    signals: { popularity: 43, diversity: 94 },
    english: {
      title: 'BBC Yoruba',
      description:
        'News and conversation in Yoruba from Nigeria, Benin, Togo, and the diaspora. A proverb-rich language, on the radio.',
    },
  }),
  podcast({
    id: 'bbc-somali',
    title: 'BBC Somali',
    language: 'so',
    creators: ['BBC Somali'],
    description:
      'Warar iyo falanqayn af-Soomaali ah: Geeska Afrika, Yemen, iyo qurbajoogta. Dhaqanka oral ee soo jiray ka hor qoraalka rasmiga ah.',
    tags: ['somali', 'horn', 'news', 'oral-tradition'],
    genres: ['news', 'culture'],
    region: 'horn-of-africa',
    country: 'Somalia',
    countryCode: 'SO',
    urls: {
      website: 'https://www.bbc.com/somali',
    },
    signals: { popularity: 46, diversity: 96 },
    english: {
      title: 'BBC Somali',
      description:
        'News and analysis in Somali from the Horn of Africa, Yemen, and the diaspora. An oral culture that predates official print.',
    },
  }),
  podcast({
    id: 'the-greek-current',
    title: 'The Greek Current',
    language: 'el',
    creators: ['The Greek Current'],
    description:
      'Ελληνική επικαιρότητα και γεωπολιτική του Αιγαίου: Κύπρος, ενέργεια, γειτονιές της Αθήνας. Ένα δελτίο που δεν μεταφράζει μόνο τις πρεσβείες.',
    tags: ['greece', 'geopolitics', 'aegean', 'news'],
    genres: ['news', 'current-affairs'],
    region: 'southern-europe',
    country: 'Greece',
    countryCode: 'GR',
    urls: {
      website: 'https://www.greekcurrent.com/',
    },
    signals: { popularity: 34, diversity: 70 },
    english: {
      title: 'The Greek Current',
      description:
        'Greek current affairs and Aegean geopolitics: Cyprus, energy, Athens neighbourhoods. A briefing that does more than translate the embassies.',
    },
  }),
  podcast({
    id: 'de-volkskrant-podcast',
    title: 'De Volkskrant Podcast',
    language: 'nl',
    creators: ['de Volkskrant'],
    description:
      'Nederlandse journalistiek op lengte: politiek, wetenschap, de voormalige koloniën. Een krant die nog durft door te praten.',
    tags: ['netherlands', 'newspaper', 'politics', 'science'],
    genres: ['journalism', 'ideas'],
    region: 'western-europe',
    country: 'Netherlands',
    countryCode: 'NL',
    urls: {
      website: 'https://www.volkskrant.nl/podcasts',
    },
    signals: { popularity: 52, diversity: 55 },
    english: {
      title: 'The Volkskrant Podcast',
      description:
        'Dutch journalism at length: politics, science, the former colonies. A newspaper that still dares to keep talking.',
    },
  }),
  podcast({
    id: 'catradio-el-matí',
    title: 'El matí de Catalunya Ràdio',
    language: 'ca',
    creators: ['Catalunya Ràdio'],
    description:
      'Magazín matinal en català: política, cultura i carrer. La llengua pública d’un país que la defensa cada dia a l’antena.',
    tags: ['catalan', 'morning', 'public-radio', 'barcelona'],
    genres: ['news', 'culture'],
    region: 'iberia',
    country: 'Spain',
    countryCode: 'ES',
    urls: {
      website: 'https://www.ccma.cat/catradio/',
    },
    signals: { popularity: 49, diversity: 85 },
    english: {
      title: 'Catalunya Ràdio Morning',
      description:
        'A morning magazine in Catalan: politics, culture, and the street. The public language of a country that defends it on air every day.',
    },
  }),
  podcast({
    id: 'euskadi-irratia',
    title: 'Euskadi Irratia',
    language: 'eu',
    creators: ['EITB'],
    description:
      'Euskarazko irrati publikoa: albisteak, bertsolaritza, eta herrietako ahotsak. Hizkuntza minorizatu bat, lehen planoan.',
    tags: ['basque', 'public-radio', 'bertso', 'euskara'],
    genres: ['news', 'culture'],
    region: 'iberia',
    country: 'Spain',
    countryCode: 'ES',
    urls: {
      website: 'https://www.eitb.eus/eu/irratia/euskadi-irratia/',
    },
    signals: { popularity: 31, diversity: 97 },
    english: {
      title: 'Euskadi Irratia',
      description:
        'Basque-language public radio: news, bertso, and village voices. A minority language, in the foreground.',
    },
  }),
  podcast({
    id: 'bbc-cymru-fawr',
    title: 'Post Cyntaf',
    language: 'cy',
    creators: ['BBC Cymru'],
    description:
      'Newyddion a sgwrs yn y Gymraeg. Radio cyhoeddus sy’n trin y iaith fel peth byw, nid eitem treftadaeth.',
    tags: ['welsh', 'news', 'public-radio', 'cymru'],
    genres: ['news', 'culture'],
    region: 'uk-ireland',
    country: 'United Kingdom',
    countryCode: 'GB',
    urls: {
      website: 'https://www.bbc.co.uk/cymrufyw',
    },
    signals: { popularity: 32, diversity: 95 },
    english: {
      title: 'First Post',
      description:
        'News and conversation in Welsh. Public radio that treats the language as a living thing, not a heritage item.',
    },
  }),
  podcast({
    id: 'ruv-helgarutvarp',
    title: 'Helgarútvarp',
    language: 'is',
    creators: ['RÚV'],
    description:
      'Íslenskt alþjóðlegt útvarp um helgar: bókmenntir, þjóðtrú og smáþjóð sem talar við sjálfa sig á eigin tungu.',
    tags: ['icelandic', 'literature', 'public-radio', 'island'],
    genres: ['culture', 'ideas'],
    region: 'nordic',
    country: 'Iceland',
    countryCode: 'IS',
    urls: {
      website: 'https://www.ruv.is/',
    },
    signals: { popularity: 29, diversity: 88 },
    english: {
      title: 'Weekend Radio',
      description:
        'Icelandic weekend public radio: literature, folklore, and a small nation speaking to itself in its own tongue.',
    },
  }),
  podcast({
    id: 'hardcore-history',
    title: 'Hardcore History',
    language: 'en',
    creators: ['Dan Carlin'],
    description:
      'Multi-hour history epics that treat the past as a place you can still get lost in. Independent, irregular, and widely imitated.',
    tags: ['history', 'independent', 'longform', 'war'],
    genres: ['history', 'education'],
    region: 'north-america',
    country: 'United States',
    countryCode: 'US',
    urls: {
      website: 'https://www.dancarlin.com/',
    },
    signals: { popularity: 93, diversity: 26 },
    year: 2006,
  }),
  podcast({
    id: 'revoluciones',
    title: 'Revoluciones',
    language: 'es',
    creators: ['Felipe Pigna', 'various historians'],
    description:
      'Historia latinoamericana en episodios: independencias, golpes, y la calle. Un aula sin pupitre, en castellano rioplatense y más allá.',
    tags: ['history', 'latam', 'revolutions', 'education'],
    genres: ['history', 'education'],
    region: 'latin-america',
    country: 'Argentina',
    countryCode: 'AR',
    urls: {
      website: 'https://www.ivoox.com/',
    },
    signals: { popularity: 40, diversity: 73 },
    english: {
      title: 'Revolutions',
      description:
        'Latin American history in episodes: independences, coups, and the street. A classroom without desks, in Rioplatense Spanish and beyond.',
    },
  }),
  podcast({
    id: 'it-1747339811',
    title: 'The Acres U.S.A. Podcast',
    language: 'en',
    creators: ['Taylor Henry', 'Acres U.S.A.'],
    description:
      'Weekly interviews on production-scale organic and regenerative farming from Acres U.S.A. Metadata and the Anchor RSS only; we do not host the audio.',
    tags: ['agroecology', 'regeneration', 'soil', 'organic', 'acres'],
    genres: ['science', 'society-culture'],
    region: 'north-america',
    country: 'United States',
    countryCode: 'US',
    urls: {
      rss: 'https://anchor.fm/s/f00de8c8/podcast/rss',
      website: 'https://www.acresusa.com/',
      store:
        'https://podcasts.apple.com/us/podcast/the-acres-u-s-a-podcast/id1747339811',
    },
    coverArt:
      'https://d3t3ozftmdmh3i.cloudfront.net/staging/podcast_uploaded_nologo/40174434/40174434-1715120326137-31acfdd32b592.jpg',
    signals: { popularity: 78, diversity: 34 },
    episodeCount: 128,
    year: 2024,
  }),
];
