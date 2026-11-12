import { useState } from 'react';
import { BookOpen, Globe2, TableProperties } from 'lucide-react';
import { GlobeView } from './components/GlobeView';
import { CountryIndex } from './components/CountryIndex';
import type { Country } from './data/countries';

type View = 'globe' | 'index';

export default function App() {
  const [view, setView] = useState<View>('globe');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  const exploreCountry = (country: Country) => {
    setSelectedCountry(country);
    setView('globe');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setView('globe')} aria-label="Country Club home">
          <span className="brand-mark"><Globe2 size={19} strokeWidth={1.8} /></span>
          <span className="brand-copy">
            <strong>COUNTRY CLUB</strong>
            <small>WORLD FIELD GUIDE</small>
          </span>
        </button>

        <nav className="primary-nav" aria-label="Primary navigation">
          <button className={view === 'globe' ? 'active' : ''} onClick={() => setView('globe')}>
            <Globe2 size={15} /> Explore globe
          </button>
          <button className={view === 'index' ? 'active' : ''} onClick={() => setView('index')}>
            <TableProperties size={15} /> Country index
          </button>
        </nav>

        <div className="top-actions">
          <span className="edition"><i /> LIVE ATLAS · 2026</span>
        </div>
      </header>

      <main>
        {view === 'globe' ? (
          <GlobeView selectedCountry={selectedCountry} onSelectCountry={setSelectedCountry} />
        ) : (
          <CountryIndex onExplore={exploreCountry} />
        )}
      </main>

      <footer className="site-footer">
        <span><BookOpen size={14} /> Built as an interactive geographic field guide</span>
        <span>Elevation & coastline values are reference estimates · Capital populations marked “est.”</span>
      </footer>
    </div>
  );
}
