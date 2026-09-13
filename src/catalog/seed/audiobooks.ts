import { audiobook } from './helpers';

export const AUDIOBOOKS = [
  audiobook({
    id: 'pride-and-prejudice',
    title: 'Pride and Prejudice',
    language: 'en',
    creators: ['Jane Austen', 'LibriVox volunteers'],
    description:
      'Austen’s comedy of manners, read by volunteers for the public domain. Still the most borrowed English novel in open audio libraries.',
    tags: ['public-domain', 'novel', 'regency', 'librivox'],
    genres: ['fiction', 'classics'],
    region: 'uk-ireland',
    country: 'United Kingdom',
    countryCode: 'GB',
    urls: {
      librivox: 'https://librivox.org/pride-and-prejudice-by-jane-austen/',
      website: 'https://www.gutenberg.org/ebooks/1342',
    },
    signals: { popularity: 91, diversity: 22 },
    year: 1813,
    durationHours: 11,
  }),
  audiobook({
    id: 'don-quijote',
    title: 'Don Quijote de la Mancha',
    language: 'es',
    creators: ['Miguel de Cervantes', 'LibriVox volunteers'],
    description:
      'La novela fundacional en castellano, en lectura abierta. Un hidalgo, un escudero, y el problema de tomarse los libros demasiado en serio.',
    tags: ['public-domain', 'novel', 'golden-age', 'librivox'],
    genres: ['fiction', 'classics'],
    region: 'iberia',
    country: 'Spain',
    countryCode: 'ES',
    urls: {
      librivox:
        'https://librivox.org/don-quijote-volume-1-by-miguel-de-cervantes-saavedra/',
      website: 'https://www.gutenberg.org/ebooks/2000',
    },
    signals: { popularity: 72, diversity: 64 },
    year: 1605,
    durationHours: 36,
    english: {
      title: 'Don Quixote',
      description:
        'The founding novel in Spanish, in an open reading. A hidalgo, a squire, and the problem of taking books too seriously.',
    },
  }),
  audiobook({
    id: 'les-miserables',
    title: 'Les Misérables',
    language: 'fr',
    creators: ['Victor Hugo', 'LibriVox volunteers'],
    description:
      'L’épopée hugolienne en français: Javert, les égouts, Waterloo, et une nation qui se raconte à elle-même. Domaine public, voix bénévoles.',
    tags: ['public-domain', 'novel', 'france', 'librivox'],
    genres: ['fiction', 'classics'],
    region: 'western-europe',
    country: 'France',
    countryCode: 'FR',
    urls: {
      librivox: 'https://librivox.org/les-miserables-by-victor-hugo/',
      website: 'https://www.gutenberg.org/ebooks/17489',
    },
    signals: { popularity: 78, diversity: 52 },
    year: 1862,
    durationHours: 57,
    english: {
      title: 'Les Misérables',
      description:
        'Hugo’s epic in French: Javert, the sewers, Waterloo, and a nation telling itself. Public domain, volunteer voices.',
    },
  }),
  audiobook({
    id: 'crime-and-punishment',
    title: 'Преступление и наказание',
    language: 'ru',
    creators: ['Fyodor Dostoevsky', 'LibriVox volunteers'],
    description:
      'Петербург Достоевского вслух: совесть, лестницы, жара. Русская классика в общественном достоянии — не перевод, а оригинал.',
    tags: ['public-domain', 'novel', 'petersburg', 'librivox'],
    genres: ['fiction', 'classics'],
    region: 'eastern-europe',
    country: 'Russia',
    countryCode: 'RU',
    urls: {
      librivox:
        'https://librivox.org/prestuplenie-i-nakazanie-by-fyodor-dostoyevsky/',
      website: 'https://www.gutenberg.org/ebooks/2554',
    },
    signals: { popularity: 70, diversity: 61 },
    year: 1866,
    durationHours: 20,
    english: {
      title: 'Crime and Punishment',
      description:
        'Dostoevsky’s Petersburg read aloud: conscience, stairwells, heat. Russian classic in the public domain — the original, not a translation.',
    },
  }),
  audiobook({
    id: 'divina-commedia',
    title: 'La Divina Commedia',
    language: 'it',
    creators: ['Dante Alighieri', 'LibriVox volunteers'],
    description:
      'Inferno, Purgatorio, Paradiso letti in toscano. Il poema che ha insegnato all’italiano a riconoscersi. Dominio pubblico.',
    tags: ['public-domain', 'poetry', 'medieval', 'librivox'],
    genres: ['poetry', 'classics'],
    region: 'southern-europe',
    country: 'Italy',
    countryCode: 'IT',
    urls: {
      librivox: 'https://librivox.org/la-divina-commedia-by-dante-alighieri/',
      website: 'https://www.gutenberg.org/ebooks/1012',
    },
    signals: { popularity: 66, diversity: 58 },
    year: 1320,
    durationHours: 13,
    english: {
      title: 'The Divine Comedy',
      description:
        'Inferno, Purgatorio, Paradiso read in Tuscan. The poem that taught Italian to recognize itself. Public domain.',
    },
  }),
  audiobook({
    id: 'odyssey-homer',
    title: 'Ὀδύσσεια',
    language: 'el',
    creators: ['Homer', 'LibriVox volunteers'],
    description:
      'Η επιστροφή του Οδυσσέα, σε νεοελληνική ή αρχαία ανάγνωση ανοιχτού αρχείου. Έπος της Μεσογείου πριν από το μυθιστόρημα.',
    tags: ['public-domain', 'epic', 'mediterranean', 'librivox'],
    genres: ['poetry', 'classics'],
    region: 'southern-europe',
    country: 'Greece',
    countryCode: 'GR',
    urls: {
      librivox: 'https://librivox.org/the-odyssey-by-homer/',
      website: 'https://www.gutenberg.org/ebooks/1727',
    },
    signals: { popularity: 74, diversity: 63 },
    year: -700,
    durationHours: 11,
    english: {
      title: 'The Odyssey',
      description:
        'Odysseus’s return, in an open-library reading. A Mediterranean epic from before the novel.',
    },
  }),
  audiobook({
    id: 'thousand-and-one-nights',
    title: 'ألف ليلة وليلة',
    language: 'ar',
    creators: ['Anonymous compilers', 'LibriVox volunteers'],
    description:
      'حكايات شهرزاد في الملك العام: تجار، جنّ، مدن ميناء. أرشيف شفهي عبر القرون، لا مؤلف واحد.',
    tags: ['public-domain', 'frame-tale', 'oral', 'librivox'],
    genres: ['fiction', 'folklore'],
    region: 'arabia',
    country: 'Iraq',
    countryCode: 'IQ',
    urls: {
      librivox: 'https://librivox.org/the-thousand-and-one-nights-vol-1-anon/',
      website: 'https://www.gutenberg.org/ebooks/3435',
    },
    signals: { popularity: 69, diversity: 82 },
    year: 900,
    durationHours: 18,
    english: {
      title: 'One Thousand and One Nights',
      description:
        'Scheherazade’s tales in the public domain: merchants, jinn, port cities. An oral archive across centuries, no single author.',
    },
  }),
  audiobook({
    id: 'ramayana-valmiki',
    title: 'रामायणम्',
    language: 'sa',
    creators: ['Valmiki', 'public-domain reciters'],
    description:
      'वाल्मीकि रामायण के सार्वजनिक पाठ: काव्य, धर्म, और एक महाद्वीप की स्मृति। स्टोर लिंक नहीं — खुला पाठ।',
    tags: ['public-domain', 'epic', 'sanskrit', 'hindu-epics'],
    genres: ['poetry', 'sacred-text'],
    region: 'india',
    country: 'India',
    countryCode: 'IN',
    urls: {
      website: 'https://www.gutenberg.org/ebooks/24869',
      librivox: 'https://librivox.org/the-ramayana-of-valmiki/',
    },
    signals: { popularity: 61, diversity: 90 },
    year: -400,
    durationHours: 24,
    english: {
      title: 'The Ramayana',
      description:
        'Public-domain recitations of Valmiki’s Ramayana: poetry, dharma, and a continent’s memory. An open reading, not a store link.',
    },
  }),
  audiobook({
    id: 'journey-to-the-west',
    title: '西游记',
    language: 'zh',
    creators: ['吴承恩', 'LibriVox volunteers'],
    description:
      '孙悟空的公版朗读：取经、天庭、人间。汉语白话小说里走得最远的一条路。',
    tags: ['public-domain', 'novel', 'myth', 'librivox'],
    genres: ['fiction', 'classics'],
    region: 'east-asia',
    country: 'China',
    countryCode: 'CN',
    urls: {
      website: 'https://www.gutenberg.org/ebooks/23962',
      librivox: 'https://librivox.org/journey-to-the-west-by-wu-cheng-en/',
    },
    signals: { popularity: 68, diversity: 76 },
    year: 1592,
    durationHours: 40,
    english: {
      title: 'Journey to the West',
      description:
        'A public-domain reading of Sun Wukong: pilgrimage, heaven, the human road. The farthest walk in vernacular Chinese fiction.',
    },
  }),
  audiobook({
    id: 'rubaiyat-khayyam',
    title: 'رباعیات خیام',
    language: 'fa',
    creators: ['Omar Khayyam', 'public-domain reciters'],
    description:
      'رباعی‌های خیام در دامنه عمومی: شراب، شک، ریاضیات، باغ. شعر فارسی که از نیشابور به تمام جهان رفت.',
    tags: ['public-domain', 'poetry', 'persian', 'quatrain'],
    genres: ['poetry', 'classics'],
    region: 'persianate',
    country: 'Iran',
    countryCode: 'IR',
    urls: {
      website: 'https://www.gutenberg.org/ebooks/246',
      librivox:
        'https://librivox.org/the-rubaiyat-of-omar-khayyam-by-omar-khayyam/',
    },
    signals: { popularity: 58, diversity: 84 },
    year: 1120,
    durationHours: 1,
    english: {
      title: 'The Rubaiyat of Omar Khayyam',
      description:
        'Khayyam’s quatrains in the public domain: wine, doubt, mathematics, the garden. Persian poetry that travelled from Nishapur to the world.',
    },
  }),
  audiobook({
    id: 'frankenstein',
    title: 'Frankenstein; or, The Modern Prometheus',
    language: 'en',
    creators: ['Mary Shelley', 'LibriVox volunteers'],
    description:
      'The 1818 novel that asked who owes care to the thing they make. Arctic frame, laboratory middle, public-domain voice.',
    tags: ['public-domain', 'gothic', 'science', 'librivox'],
    genres: ['fiction', 'classics'],
    region: 'uk-ireland',
    country: 'United Kingdom',
    countryCode: 'GB',
    urls: {
      librivox:
        'https://librivox.org/frankenstein-or-the-modern-prometheus-1818-by-mary-wollstonecraft-shelley/',
      website: 'https://www.gutenberg.org/ebooks/84',
    },
    signals: { popularity: 88, diversity: 24 },
    year: 1818,
    durationHours: 8,
  }),
  audiobook({
    id: 'poe-tales',
    title: 'Tales of Mystery and Imagination',
    language: 'en',
    creators: ['Edgar Allan Poe', 'LibriVox volunteers'],
    description:
      'Poe’s short fiction as volunteer audio: the tell-tale heart, the masque, the stolen letter. American gothic without a paywall.',
    tags: ['public-domain', 'short-story', 'gothic', 'librivox'],
    genres: ['fiction', 'classics'],
    region: 'north-america',
    country: 'United States',
    countryCode: 'US',
    urls: {
      librivox:
        'https://librivox.org/short-story-collection-vol-001-by-various/',
      website: 'https://www.gutenberg.org/ebooks/2147',
    },
    signals: { popularity: 80, diversity: 27 },
    year: 1845,
    durationHours: 6,
  }),
  audiobook({
    id: 'things-fall-apart-meta',
    title: 'Things Fall Apart',
    language: 'en',
    creators: ['Chinua Achebe'],
    description:
      'Achebe’s 1958 novel of Igbo life and colonial rupture. Still in copyright: this record is metadata and store links only — no audio file is hosted.',
    tags: ['nigeria', 'novel', 'igbo', 'copyrighted'],
    genres: ['fiction', 'modern-classics'],
    region: 'west-africa',
    country: 'Nigeria',
    countryCode: 'NG',
    urls: {
      store:
        'https://www.penguinrandomhouse.com/books/565351/things-fall-apart-by-chinua-achebe/',
      website: 'https://en.wikipedia.org/wiki/Things_Fall_Apart',
    },
    signals: { popularity: 86, diversity: 79 },
    year: 1958,
    durationHours: 6,
  }),
  audiobook({
    id: 'cien-anos-de-soledad',
    title: 'Cien años de soledad',
    language: 'es',
    creators: ['Gabriel García Márquez'],
    description:
      'Macondo en la ficha, no en el servidor. Novela bajo derechos: enlaces a editoriales y tiendas, nunca el audio.',
    tags: ['colombia', 'novel', 'copyrighted', 'boom'],
    genres: ['fiction', 'modern-classics'],
    region: 'latin-america',
    country: 'Colombia',
    countryCode: 'CO',
    urls: {
      store:
        'https://www.penguinrandomhouse.com/books/585288/one-hundred-years-of-solitude-by-gabriel-garcia-marquez/',
      website: 'https://en.wikipedia.org/wiki/One_Hundred_Years_of_Solitude',
    },
    signals: { popularity: 89, diversity: 71 },
    year: 1967,
    durationHours: 14,
    english: {
      title: 'One Hundred Years of Solitude',
      description:
        'Macondo in the catalogue card, not on the server. A novel still in copyright: publisher and store links, never the audio.',
    },
  }),
  audiobook({
    id: 'beloved-morrison',
    title: 'Beloved',
    language: 'en',
    creators: ['Toni Morrison'],
    description:
      'Morrison’s novel of memory after slavery. Catalogued for discovery; licensed editions live with publishers and libraries, not here.',
    tags: ['united-states', 'novel', 'copyrighted', 'memory'],
    genres: ['fiction', 'modern-classics'],
    region: 'north-america',
    country: 'United States',
    countryCode: 'US',
    urls: {
      store:
        'https://www.penguinrandomhouse.com/books/117646/beloved-by-toni-morrison/',
      website: 'https://en.wikipedia.org/wiki/Beloved_(novel)',
    },
    signals: { popularity: 84, diversity: 67 },
    year: 1987,
    durationHours: 12,
  }),
  audiobook({
    id: 'midnights-children',
    title: "Midnight's Children",
    language: 'en',
    creators: ['Salman Rushdie'],
    description:
      'India’s independence told as a body that cannot stay in one register. Metadata and store links only.',
    tags: ['india', 'novel', 'copyrighted', 'partition'],
    genres: ['fiction', 'modern-classics'],
    region: 'india',
    country: 'United Kingdom',
    countryCode: 'GB',
    urls: {
      store:
        'https://www.penguinrandomhouse.com/books/158234/midnights-children-by-salman-rushdie/',
      website: 'https://en.wikipedia.org/wiki/Midnight%27s_Children',
    },
    signals: { popularity: 76, diversity: 72 },
    year: 1981,
    durationHours: 24,
  }),
  audiobook({
    id: 'god-of-small-things',
    title: 'The God of Small Things',
    language: 'en',
    creators: ['Arundhati Roy'],
    description:
      'A Kerala novel of caste, twins, and the river. Discoverable here; playable where you have a licence.',
    tags: ['kerala', 'novel', 'copyrighted', 'malayalam-world'],
    genres: ['fiction', 'modern-classics'],
    region: 'india',
    country: 'India',
    countryCode: 'IN',
    urls: {
      store:
        'https://www.penguinrandomhouse.com/books/158232/the-god-of-small-things-by-arundhati-roy/',
      website: 'https://en.wikipedia.org/wiki/The_God_of_Small_Things',
    },
    signals: { popularity: 73, diversity: 74 },
    year: 1997,
    durationHours: 12,
  }),
  audiobook({
    id: 'season-of-migration',
    title: 'موسم الهجرة إلى الشمال',
    language: 'ar',
    creators: ['الطيب صالح'],
    description:
      'رواية الطيب صالح عن السودان ولندن والاستعمار الذي يعود في الجسد. بطاقة فهرست، لا ملف صوتي.',
    tags: ['sudan', 'novel', 'copyrighted', 'postcolonial'],
    genres: ['fiction', 'modern-classics'],
    region: 'east-africa',
    country: 'Sudan',
    countryCode: 'SD',
    urls: {
      store: 'https://nyrb.com/products/season-of-migration-to-the-north',
      website: 'https://en.wikipedia.org/wiki/Season_of_Migration_to_the_North',
    },
    signals: { popularity: 54, diversity: 88 },
    year: 1966,
    durationHours: 6,
    english: {
      title: 'Season of Migration to the North',
      description:
        'Tayeb Salih’s novel of Sudan, London, and empire returning in the body. A catalogue card, not an audio file.',
    },
  }),
  audiobook({
    id: 'tale-of-genji',
    title: '源氏物語',
    language: 'ja',
    creators: ['紫式部', 'public-domain translators'],
    description:
      '平安朝の長篇。英語パブリックドメイン訳と日本語原文への案内。音声ファイルは置かない。',
    tags: ['heian', 'novel', 'court', 'public-domain-translation'],
    genres: ['fiction', 'classics'],
    region: 'east-asia',
    country: 'Japan',
    countryCode: 'JP',
    urls: {
      website: 'https://www.gutenberg.org/ebooks/66057',
      librivox: 'https://librivox.org/the-tale-of-genji-by-murasaki-shikibu/',
    },
    signals: { popularity: 63, diversity: 77 },
    year: 1021,
    durationHours: 50,
    english: {
      title: 'The Tale of Genji',
      description:
        'The Heian long novel. Pointers to public-domain English translations and the Japanese text. No audio file is stored here.',
    },
  }),
  audiobook({
    id: 'pedro-paramo',
    title: 'Pedro Páramo',
    language: 'es',
    creators: ['Juan Rulfo'],
    description:
      'Comala y los murmullos. Novela breve bajo derechos: ficha y enlaces de librería, no el audio.',
    tags: ['mexico', 'novel', 'copyrighted', 'murmurs'],
    genres: ['fiction', 'modern-classics'],
    region: 'mesoamerica',
    country: 'Mexico',
    countryCode: 'MX',
    urls: {
      store: 'https://www.groveatlantic.com/book/pedro-paramo/',
      website: 'https://en.wikipedia.org/wiki/Pedro_P%C3%A1ramo',
    },
    signals: { popularity: 67, diversity: 75 },
    year: 1955,
    durationHours: 4,
    english: {
      title: 'Pedro Páramo',
      description:
        'Comala and the murmurs. A short novel still in copyright: card and bookshop links, not the audio.',
    },
  }),
  audiobook({
    id: 'disgrace-coetzee',
    title: 'Disgrace',
    language: 'en',
    creators: ['J. M. Coetzee'],
    description:
      'Post-apartheid South Africa in a lean novel. Catalogued for readers; audio belongs to licensed editions.',
    tags: ['south-africa', 'novel', 'copyrighted', 'campus'],
    genres: ['fiction', 'modern-classics'],
    region: 'southern-africa',
    country: 'South Africa',
    countryCode: 'ZA',
    urls: {
      store:
        'https://www.penguinrandomhouse.com/books/29036/disgrace-by-j-m-coetzee/',
      website: 'https://en.wikipedia.org/wiki/Disgrace_(novel)',
    },
    signals: { popularity: 71, diversity: 70 },
    year: 1999,
    durationHours: 7,
  }),
  audiobook({
    id: 'housekeeper-and-professor',
    title: '博士の愛した数式',
    language: 'ja',
    creators: ['小川洋子'],
    description:
      '記憶が八十打で戻る数学者と、家政婦と息子。著作権下の現代小説：発見用の記録のみ。',
    tags: ['japan', 'novel', 'copyrighted', 'mathematics'],
    genres: ['fiction', 'contemporary'],
    region: 'east-asia',
    country: 'Japan',
    countryCode: 'JP',
    urls: {
      store: 'https://www.picador.com/books/the-housekeeper-and-the-professor',
      website:
        'https://en.wikipedia.org/wiki/The_Housekeeper_and_the_Professor',
    },
    signals: { popularity: 59, diversity: 73 },
    year: 2003,
    durationHours: 5,
    english: {
      title: 'The Housekeeper and the Professor',
      description:
        'A mathematician whose memory resets at eighty minutes, a housekeeper, and her son. A contemporary novel in copyright: a discovery record only.',
    },
  }),
  audiobook({
    id: 'americanah',
    title: 'Americanah',
    language: 'en',
    creators: ['Chimamanda Ngozi Adichie'],
    description:
      'Lagos, Princeton, hair, blogs, and the politics of return. Metadata for a novel you open elsewhere.',
    tags: ['nigeria', 'novel', 'copyrighted', 'migration'],
    genres: ['fiction', 'contemporary'],
    region: 'west-africa',
    country: 'Nigeria',
    countryCode: 'NG',
    urls: {
      store:
        'https://www.penguinrandomhouse.com/books/100386/americanah-by-chimamanda-ngozi-adichie/',
      website: 'https://en.wikipedia.org/wiki/Americanah',
    },
    signals: { popularity: 81, diversity: 78 },
    year: 2013,
    durationHours: 17,
  }),
  audiobook({
    id: 'popol-vuh',
    title: 'Popol Vuh',
    language: 'es',
    creators: ['Kʼicheʼ authors', 'public-domain translators'],
    description:
      'El libro del consejo maya kʼicheʼ, en traducciones de dominio público. Creación, gemelos, y un continente que ya se narraba.',
    tags: ['maya', 'sacred-text', 'public-domain', 'mesoamerica'],
    genres: ['sacred-text', 'folklore'],
    region: 'mesoamerica',
    country: 'Guatemala',
    countryCode: 'GT',
    urls: {
      website: 'https://www.gutenberg.org/ebooks/20775',
      librivox: 'https://librivox.org/popol-vuh-by-anonymous/',
    },
    signals: { popularity: 48, diversity: 94 },
    year: 1550,
    durationHours: 5,
    english: {
      title: 'Popol Vuh',
      description:
        'The Kʼicheʼ Maya council book, in public-domain translations. Creation, twins, and a continent that was already narrating itself.',
    },
  }),
  audiobook({
    id: 'sundiata',
    title: 'Soundjata ou l’épopée mandingue',
    language: 'fr',
    creators: ['Djibril Tamsir Niane', 'griot tradition'],
    description:
      'L’épopée de Soundiata Keïta, du Mali à la page. Œuvre encore protégée dans de nombreuses éditions: notices et librairies, pas le fichier.',
    tags: ['mali', 'epic', 'griot', 'copyrighted'],
    genres: ['poetry', 'folklore'],
    region: 'west-africa',
    country: 'Guinea',
    countryCode: 'GN',
    urls: {
      store:
        'https://www.pearson.com/en-us/subject-catalog/p/sundiata-an-epic-of-old-mali/P200000003474',
      website: 'https://en.wikipedia.org/wiki/Epic_of_Sundiata',
    },
    signals: { popularity: 45, diversity: 93 },
    year: 1960,
    durationHours: 4,
    english: {
      title: 'Sundiata: An Epic of Old Mali',
      description:
        'The epic of Sundiata Keita, from Mali to the page. Still protected in many editions: notices and bookshops, not the file.',
    },
  }),
  audiobook({
    id: 'kalevala',
    title: 'Kalevala',
    language: 'fi',
    creators: ['Elias Lönnrot', 'LibriVox volunteers'],
    description:
      'Suomen kansalliseepos avoimena lukuna: Väinämöinen, sampo, runomitta. Julkinen perintö, ei kauppa.',
    tags: ['public-domain', 'epic', 'finland', 'librivox'],
    genres: ['poetry', 'folklore'],
    region: 'nordic',
    country: 'Finland',
    countryCode: 'FI',
    urls: {
      librivox: 'https://librivox.org/kalevala-by-elias-lonnrot/',
      website: 'https://www.gutenberg.org/ebooks/5186',
    },
    signals: { popularity: 44, diversity: 81 },
    year: 1849,
    durationHours: 14,
    english: {
      title: 'The Kalevala',
      description:
        'The Finnish national epic as an open reading: Väinämöinen, the sampo, the runo metre. Public inheritance, not a shop.',
    },
  }),
  audiobook({
    id: 'mahabharata-excerpts',
    title: 'महाभारतम्',
    language: 'sa',
    creators: ['Vyasa', 'public-domain reciters'],
    description:
      'महाभारत के सार्वजनिक अंश: युद्ध, धर्म, और संवाद जो अभी भी मंचों पर चलते हैं। पूरा ग्रंथ एक फ़ाइल नहीं है।',
    tags: ['public-domain', 'epic', 'sanskrit', 'excerpts'],
    genres: ['poetry', 'sacred-text'],
    region: 'india',
    country: 'India',
    countryCode: 'IN',
    urls: {
      website: 'https://www.gutenberg.org/ebooks/15474',
      librivox: 'https://librivox.org/the-mahabharata-by-vyasa/',
    },
    signals: { popularity: 57, diversity: 91 },
    year: -300,
    durationHours: 30,
    english: {
      title: 'The Mahabharata (excerpts)',
      description:
        'Public-domain excerpts of the Mahabharata: war, dharma, and dialogues still staged. The whole book is not one file.',
    },
  }),
  audiobook({
    id: 'noli-me-tangere',
    title: 'Noli Me Tangere',
    language: 'es',
    creators: ['José Rizal', 'LibriVox volunteers'],
    description:
      'La novela que anticipó la revolución filipina, en castellano de 1887. Dominio público: frailes, ilustrados, y un país leyéndose.',
    tags: ['philippines', 'novel', 'public-domain', 'reform'],
    genres: ['fiction', 'classics'],
    region: 'southeast-asia',
    country: 'Philippines',
    countryCode: 'PH',
    urls: {
      librivox: 'https://librivox.org/noli-me-tangere-by-jose-rizal/',
      website: 'https://www.gutenberg.org/ebooks/20228',
    },
    signals: { popularity: 50, diversity: 86 },
    year: 1887,
    durationHours: 16,
    english: {
      title: 'Noli Me Tangere',
      description:
        'The novel that anticipated the Philippine revolution, in 1887 Spanish. Public domain: friars, ilustrados, and a country reading itself.',
    },
  }),
  audiobook({
    id: 'os-lusiadas',
    title: 'Os Lusíadas',
    language: 'pt',
    creators: ['Luís de Camões', 'LibriVox volunteers'],
    description:
      'O poema épico português do Índico: Ventos, deuses, e a costa africana vista do convés. Domínio público.',
    tags: ['public-domain', 'epic', 'portugal', 'indian-ocean'],
    genres: ['poetry', 'classics'],
    region: 'iberia',
    country: 'Portugal',
    countryCode: 'PT',
    urls: {
      librivox: 'https://librivox.org/os-lusiadas-by-luis-vaz-de-camoes/',
      website: 'https://www.gutenberg.org/ebooks/3333',
    },
    signals: { popularity: 47, diversity: 69 },
    year: 1572,
    durationHours: 10,
    english: {
      title: 'The Lusiads',
      description:
        'The Portuguese epic of the Indian Ocean: winds, gods, and the African coast seen from the deck. Public domain.',
    },
  }),
  audiobook({
    id: 'anna-karenina',
    title: 'Анна Каренина',
    language: 'ru',
    creators: ['Leo Tolstoy', 'LibriVox volunteers'],
    description:
      'Толстой в оригинале и в открытых переводах. Семьи, поезда, и фраза про счастливые семьи — без магазина.',
    tags: ['public-domain', 'novel', 'russia', 'librivox'],
    genres: ['fiction', 'classics'],
    region: 'eastern-europe',
    country: 'Russia',
    countryCode: 'RU',
    urls: {
      librivox: 'https://librivox.org/anna-karenina-by-leo-tolstoy-2/',
      website: 'https://www.gutenberg.org/ebooks/1399',
    },
    signals: { popularity: 82, diversity: 50 },
    year: 1877,
    durationHours: 35,
    english: {
      title: 'Anna Karenina',
      description:
        'Tolstoy in the original and in open translations. Families, trains, and the sentence about happy families — without a shopfront.',
    },
  }),
];
