export interface RegionInfo {
  id: string;
  name: string;
  continent: string;
}

export const REGIONS: RegionInfo[] = [
  { id: 'andes', name: 'Andes', continent: 'South America' },
  { id: 'arabia', name: 'Arabian Peninsula', continent: 'Asia' },
  { id: 'balkans', name: 'Balkans', continent: 'Europe' },
  { id: 'caribbean', name: 'Caribbean', continent: 'North America' },
  { id: 'caucasus', name: 'Caucasus', continent: 'Asia' },
  { id: 'central-africa', name: 'Central Africa', continent: 'Africa' },
  { id: 'central-asia', name: 'Central Asia', continent: 'Asia' },
  { id: 'central-europe', name: 'Central Europe', continent: 'Europe' },
  { id: 'east-africa', name: 'East Africa', continent: 'Africa' },
  { id: 'east-asia', name: 'East Asia', continent: 'Asia' },
  { id: 'eastern-europe', name: 'Eastern Europe', continent: 'Europe' },
  { id: 'horn-of-africa', name: 'Horn of Africa', continent: 'Africa' },
  { id: 'iberia', name: 'Iberia', continent: 'Europe' },
  { id: 'india', name: 'Indian subcontinent', continent: 'Asia' },
  { id: 'latin-america', name: 'Latin America', continent: 'Americas' },
  { id: 'levant', name: 'Levant', continent: 'Asia' },
  { id: 'lusophone-africa', name: 'Lusophone Africa', continent: 'Africa' },
  { id: 'maghreb', name: 'Maghreb', continent: 'Africa' },
  { id: 'mesoamerica', name: 'Mesoamerica', continent: 'North America' },
  { id: 'nordic', name: 'Nordic', continent: 'Europe' },
  { id: 'north-america', name: 'North America', continent: 'North America' },
  { id: 'oceania', name: 'Oceania', continent: 'Oceania' },
  { id: 'persianate', name: 'Persianate world', continent: 'Asia' },
  { id: 'sahel', name: 'Sahel', continent: 'Africa' },
  { id: 'scandinavia', name: 'Scandinavia', continent: 'Europe' },
  { id: 'southeast-asia', name: 'Southeast Asia', continent: 'Asia' },
  { id: 'southern-africa', name: 'Southern Africa', continent: 'Africa' },
  { id: 'southern-europe', name: 'Southern Europe', continent: 'Europe' },
  { id: 'uk-ireland', name: 'UK & Ireland', continent: 'Europe' },
  { id: 'west-africa', name: 'West Africa', continent: 'Africa' },
  { id: 'western-europe', name: 'Western Europe', continent: 'Europe' },
];

const REGION_BY_ID = new Map(REGIONS.map((region) => [region.id, region]));

export function getRegion(id: string): RegionInfo {
  return (
    REGION_BY_ID.get(id) ?? {
      id,
      name: id,
      continent: 'World',
    }
  );
}
