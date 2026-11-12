import { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronRight,
  Flag,
  Globe2,
  Mountain,
  Search,
  ShipWheel,
  Users,
} from 'lucide-react';
import {
  continentColors,
  continentCounts,
  continents,
  countries,
  type Continent,
  type Country,
} from '../data/countries';

type SortKey = 'name' | 'population' | 'averageElevation' | 'capital' | 'capitalPopulation' | 'coastline' | 'flagColors';
type Direction = 'asc' | 'desc';

interface CountryIndexProps { onExplore: (country: Country) => void }

const formatNumber = (value: number) => new Intl.NumberFormat('en').format(value);
const formatCompact = (value: number) => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

export function CountryIndex({ onExplore }: CountryIndexProps) {
  const [continent, setContinent] = useState<Continent>('All countries');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('population');
  const [direction, setDirection] = useState<Direction>('desc');

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase();
    return countries
      .filter((country) => continent === 'All countries' || country.continent === continent)
      .filter((country) => !query || `${country.name} ${country.capital} ${country.code}`.toLowerCase().includes(query))
      .sort((a, b) => {
        const first = a[sortKey];
        const second = b[sortKey];
        const result = typeof first === 'string'
          ? first.localeCompare(second as string)
          : first - (second as number);
        return direction === 'asc' ? result : -result;
      });
  }, [continent, direction, search, sortKey]);

  const population = filteredCountries.reduce((sum, country) => sum + country.population, 0);
  const avgElevation = filteredCountries.length
    ? Math.round(filteredCountries.reduce((sum, country) => sum + country.averageElevation, 0) / filteredCountries.length)
    : 0;
  const coastline = filteredCountries.reduce((sum, country) => sum + country.coastline, 0);

  const sort = (key: SortKey) => {
    if (sortKey === key) setDirection(direction === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(key);
      setDirection(key === 'name' || key === 'capital' ? 'asc' : 'desc');
    }
  };

  return (
    <section className="index-page">
      <header className="index-hero">
        <div>
          <span className="eyebrow"><Globe2 size={13} /> THE WORLD, ROW BY ROW</span>
          <h1>Country <em>index.</em></h1>
          <p>Compare nations across geography, people, cities, coastlines, and the colors they fly.</p>
        </div>
        <div className="index-stamp"><strong>{countries.length}</strong><span>PLACES<br />CATALOGUED</span></div>
      </header>

      <div className="continent-picker" aria-label="Filter by continent">
        {continents.map((item) => (
          <button
            key={item}
            onClick={() => setContinent(item)}
            className={continent === item ? 'active' : ''}
            style={{ '--continent-color': item === 'All countries' ? '#e6c76f' : continentColors[item] } as React.CSSProperties}
          >
            <i />
            <span>{item}</span>
            <b>{continentCounts[item]}</b>
          </button>
        ))}
      </div>

      <div className="index-content">
        <div className="table-toolbar">
          <div>
            <span className="result-kicker">SHOWING</span>
            <strong>{filteredCountries.length} {continent === 'All countries' ? 'countries & territories' : `places in ${continent}`}</strong>
          </div>
          <label className="search-box">
            <Search size={16} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search country or capital…" />
            <kbd>⌘ K</kbd>
          </label>
        </div>

        <div className="summary-strip">
          <Summary icon={<Users size={16} />} label="Combined population" value={formatCompact(population)} />
          <Summary icon={<Mountain size={16} />} label="Mean elevation" value={`${formatNumber(avgElevation)} m`} />
          <Summary icon={<ShipWheel size={16} />} label="Combined coastline" value={`${formatCompact(coastline)} km`} />
          <Summary icon={<Flag size={16} />} label="Default sort" value="Population ↓" />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <SortHeader label="Country" sortKey="name" current={sortKey} direction={direction} onSort={sort} />
                <SortHeader label="Population" sortKey="population" current={sortKey} direction={direction} onSort={sort} align="right" />
                <SortHeader label="Avg. elevation" sortKey="averageElevation" current={sortKey} direction={direction} onSort={sort} align="right" />
                <SortHeader label="Capital city" sortKey="capital" current={sortKey} direction={direction} onSort={sort} />
                <SortHeader label="Capital pop. est." sortKey="capitalPopulation" current={sortKey} direction={direction} onSort={sort} align="right" />
                <SortHeader label="Coastline" sortKey="coastline" current={sortKey} direction={direction} onSort={sort} align="right" />
                <SortHeader label="Flag colors" sortKey="flagColors" current={sortKey} direction={direction} onSort={sort} align="center" />
                <th><span className="sr-only">Explore</span></th>
              </tr>
            </thead>
            <tbody>
              {filteredCountries.map((country, index) => (
                <tr key={country.code} onClick={() => onExplore(country)}>
                  <td>
                    <span className="row-number">{String(index + 1).padStart(2, '0')}</span>
                    <span className="table-flag">{country.flag}</span>
                    <span className="country-name"><strong>{country.name}</strong><small>{country.continent} · {country.code}</small></span>
                  </td>
                  <td className="number-cell">{formatNumber(country.population)}</td>
                  <td className="number-cell"><b className="elevation-bar" style={{ width: `${Math.min(100, country.averageElevation / 24)}%` }} />{formatNumber(country.averageElevation)} m</td>
                  <td><span className="capital-name">{country.capital}</span></td>
                  <td className="number-cell">{formatNumber(country.capitalPopulation)}</td>
                  <td className="number-cell">{country.landlocked ? <span className="landlocked">LANDLOCKED</span> : `${formatNumber(country.coastline)} km`}</td>
                  <td className="color-count"><span>{country.flagColors}</span><i>{Array.from({ length: Math.min(5, country.flagColors) }, (_, dot) => <b key={dot} />)}</i></td>
                  <td><button className="row-action" aria-label={`Explore ${country.name} on the globe`}><ChevronRight size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filteredCountries.length && <div className="empty-state">No countries match that search.</div>}
        </div>
        <p className="data-note">Capital populations are rounded prototype estimates. Elevation and coastline values are compiled reference figures and may vary by source.</p>
      </div>
    </section>
  );
}

function Summary({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="summary-item"><span>{icon}</span><div><small>{label}</small><strong>{value}</strong></div></div>;
}

function SortHeader({ label, sortKey, current, direction, onSort, align = 'left' }: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  direction: Direction;
  onSort: (key: SortKey) => void;
  align?: 'left' | 'right' | 'center';
}) {
  const Icon = current === sortKey ? (direction === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <th className={`align-${align}`}>
      <button onClick={() => onSort(sortKey)} className={current === sortKey ? 'active' : ''}>
        {label}<Icon size={13} />
      </button>
    </th>
  );
}
