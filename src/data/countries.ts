import rawCountries from 'world-countries';
import elevationData from 'country-json/src/country-by-elevation.json';
import coastlineData from 'country-json/src/country-by-costline.json';
import populationData from 'country-json/src/country-by-population.json';
import flagColors from '../generated/flag-colors.json';

export const continents = [
  'All countries',
  'Africa',
  'Asia',
  'Europe',
  'North America',
  'South America',
  'Oceania',
  'Antarctica',
] as const;

export type Continent = (typeof continents)[number];

export interface Country {
  code: string;
  numericCode: string;
  name: string;
  officialName: string;
  capital: string;
  continent: Exclude<Continent, 'All countries'>;
  population: number;
  capitalPopulation: number;
  averageElevation: number;
  coastline: number;
  flagColors: number;
  flag: string;
  area: number;
  landlocked: boolean;
  lat: number;
  lng: number;
}

const aliases: Record<string, string> = {
  'bolivia plurinational state of': 'bolivia',
  'brunei darussalam': 'brunei',
  'cabo verde': 'cape verde',
  'congo democratic republic of the': 'democratic republic of the congo',
  'congo republic of the': 'republic of the congo',
  'cote divoire': 'ivory coast',
  'czechia': 'czech republic',
  'eswatini': 'swaziland',
  'iran islamic republic of': 'iran',
  'korea democratic peoples republic of': 'north korea',
  'korea republic of': 'south korea',
  'lao peoples democratic republic': 'laos',
  'micronesia federated states of': 'micronesia',
  'moldova republic of': 'moldova',
  'russian federation': 'russia',
  'syrian arab republic': 'syria',
  'tanzania united republic of': 'tanzania',
  'timor leste': 'east timor',
  'united states of america': 'united states',
  'venezuela bolivarian republic of': 'venezuela',
  'viet nam': 'vietnam',
};

const normalize = (value: string) => {
  const key = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
  return aliases[key] ?? key;
};

const elevationMap = new Map(
  (elevationData as { country: string; elevation: number | null }[]).map((item) => [
    normalize(item.country),
    item.elevation,
  ]),
);

const coastlineMap = new Map(
  (coastlineData as { country: string; costline: number | null }[]).map((item) => [
    normalize(item.country),
    item.costline,
  ]),
);

const populationMap = new Map(
  (populationData as { country: string; population: number | null }[]).map((item) => [
    normalize(item.country),
    item.population,
  ]),
);

const flagColorMap = new Map(
  Object.entries(flagColors).map(([name, count]) => [normalize(name), count]),
);

const knownCapitalPopulations: Record<string, number> = {
  Tokyo: 37_115_000,
  Delhi: 33_807_000,
  Beijing: 22_596_000,
  Dhaka: 23_936_000,
  Cairo: 22_624_000,
  'Mexico City': 22_505_000,
  Kinshasa: 17_778_000,
  'Buenos Aires': 15_618_000,
  Manila: 14_942_000,
  Moscow: 14_880_000,
  Jakarta: 11_436_000,
  London: 9_748_000,
  Paris: 11_277_000,
  Seoul: 9_988_000,
  Tehran: 9_729_000,
  Bangkok: 11_070_000,
  Lima: 11_362_000,
  Bogotá: 11_658_000,
  Luanda: 9_651_000,
  Baghdad: 8_141_000,
  Riyadh: 7_953_000,
  Santiago: 6_903_000,
  Madrid: 6_783_000,
  Nairobi: 5_766_000,
  Ankara: 5_445_000,
  Rome: 4_316_000,
  Berlin: 3_574_000,
  Ottawa: 1_488_000,
  Canberra: 472_000,
  Washington: 6_304_000,
  Brasília: 4_873_000,
  Pretoria: 2_818_000,
};

function toContinent(region: string, subregion = ''): Country['continent'] {
  if (region === 'Americas') return subregion === 'South America' ? 'South America' : 'North America';
  if (region === 'Antarctic') return 'Antarctica';
  if (region === 'Africa' || region === 'Asia' || region === 'Europe' || region === 'Oceania') return region;
  return 'Antarctica';
}

function estimateCapitalPopulation(population: number, capital: string) {
  if (knownCapitalPopulations[capital]) return knownCapitalPopulations[capital];
  const ratio = population < 500_000 ? 0.48 : population < 5_000_000 ? 0.28 : population < 30_000_000 ? 0.14 : 0.065;
  return Math.max(1_000, Math.round((population * ratio) / 1_000) * 1_000);
}

export const countries: Country[] = rawCountries
  .filter((country) => country.status === 'officially-assigned')
  .map((country) => {
    const nameKey = normalize(country.name.common);
    const capital = country.capital?.[0] ?? '—';
    const population = populationMap.get(nameKey) ?? 0;
    const elevation = elevationMap.get(nameKey);
    const rawCoastline = coastlineMap.get(nameKey);
    const [lat, lng] = country.latlng ?? [0, 0];
    const area = country.area > 0 ? country.area : 0;
    const fallbackElevation = Math.round(120 + Math.abs(lat) * 7 + (country.landlocked ? 360 : 80));
    let coastline = country.landlocked ? 0 : (rawCoastline ?? Math.round(Math.sqrt(area) * 2.4));
    if (coastline > 0 && coastline < 60 && area > 10_000) coastline *= 1000;

    return {
      code: country.cca3,
      numericCode: country.ccn3 ?? '',
      name: country.name.common,
      officialName: country.name.official,
      capital,
      continent: toContinent(country.region, country.subregion),
      population,
      capitalPopulation: estimateCapitalPopulation(population, capital),
      averageElevation: elevation ?? fallbackElevation,
      coastline: Math.round(coastline),
      flagColors: flagColorMap.get(nameKey) ?? 3,
      flag: country.flag,
      area,
      landlocked: country.landlocked,
      lat,
      lng,
    };
  })
  .sort((a, b) => b.population - a.population);

export const countriesByNumericCode = new Map(
  countries.filter((country) => country.numericCode).map((country) => [Number(country.numericCode), country]),
);

export const continentColors: Record<Country['continent'], string> = {
  Africa: '#de7c57',
  Asia: '#edb95e',
  Europe: '#8db7ad',
  'North America': '#77a7d4',
  'South America': '#91b86a',
  Oceania: '#c988a7',
  Antarctica: '#c8d6d2',
};

export const continentCounts = Object.fromEntries(
  continents.map((continent) => [
    continent,
    continent === 'All countries' ? countries.length : countries.filter((country) => country.continent === continent).length,
  ]),
) as Record<Continent, number>;
