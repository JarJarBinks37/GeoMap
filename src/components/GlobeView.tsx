import { useState } from 'react';
import {
  CircleDot,
  CloudSun,
  Map,
  Mountain,
  RotateCcw,
  Rotate3D,
  Sparkles,
  Tag,
  X,
  Layers,
  Plus,
  Minus,
} from 'lucide-react';
import { countries, type Country } from '../data/countries';
import { mountainRanges } from '../data/mountains';
import { GlobeCanvas } from './GlobeCanvas';

interface GlobeViewProps {
  selectedCountry: Country | null;
  onSelectCountry: (country: Country | null) => void;
}

const formatNumber = (value: number) => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
const formatFull = (value: number) => new Intl.NumberFormat('en').format(value);

export function GlobeView({ selectedCountry, onSelectCountry }: GlobeViewProps) {
  const [mountains, setMountains] = useState(true);
  const [labels, setLabels] = useState(false);
  const [borders, setBorders] = useState(true);
  const [atmosphere, setAtmosphere] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [panelOpen, setPanelOpen] = useState(true);
  const [zoomSignal, setZoomSignal] = useState(0);
  const [resetSignal, setResetSignal] = useState(0);

  return (
    <section className="globe-page">
      <div className="starfield" aria-hidden="true" />

      <div className="globe-stage">
        <GlobeCanvas
          selectedCountry={selectedCountry}
          onSelectCountry={onSelectCountry}
          mountains={mountains}
          labels={labels}
          borders={borders}
          atmosphere={atmosphere}
          autoRotate={autoRotate}
          resetSignal={resetSignal}
          zoomSignal={zoomSignal}
        />
        <div className="drag-hint"><CircleDot size={14} /> Drag to rotate · Scroll to zoom · Click a country</div>
      </div>

      <button className="panel-toggle" onClick={() => setPanelOpen(!panelOpen)} aria-expanded={panelOpen} aria-controls="layer-panel"><Layers size={16} /> {panelOpen ? 'Hide layers' : 'Show layers'}</button>
      <div className="zoom-controls"><button aria-label="Zoom in" onClick={() => setZoomSignal(v => v + 1)}><Plus size={18} /></button><button aria-label="Zoom out" onClick={() => setZoomSignal(v => v - 1)}><Minus size={18} /></button></div>
      {panelOpen && <aside className="layer-panel" id="layer-panel">
        <div className="panel-heading">
          <div><span>MAP STUDIO</span><strong>Layers & style</strong></div>
          <Sparkles size={17} />
        </div>

        <div className="panel-section">
          <span className="section-label">VISIBLE LAYERS</span>
          <LayerToggle icon={<Mountain size={17} />} label="Mountain ranges" detail={`${mountainRanges.length} approximate outlines`} active={mountains} onClick={() => setMountains(!mountains)} />
          <LayerToggle icon={<Map size={17} />} label="Country borders" detail="Political" active={borders} onClick={() => setBorders(!borders)} />
          <LayerToggle icon={<Tag size={17} />} label="Country labels" detail="Major nations" active={labels} onClick={() => setLabels(!labels)} />
          <LayerToggle icon={<CloudSun size={17} />} label="Atmosphere" detail="Visual effect" active={atmosphere} onClick={() => setAtmosphere(!atmosphere)} />
        </div>

        {mountains && <div className="mountain-key"><span className="mountain-key-line" /><div><strong>Mountain ranges</strong><small>Approximate outlines · rotate to explore</small></div></div>}

        <div className="panel-actions">
          <button onClick={() => setAutoRotate(!autoRotate)} className={autoRotate ? 'active' : ''}>
            <Rotate3D size={15} /> Auto rotate
          </button>
          <button onClick={() => setResetSignal((value) => value + 1)}>
            <RotateCcw size={15} /> Reset view
          </button>
        </div>
      </aside>}

      <div className="globe-metrics">
        <div><span>{countries.length}</span><small>COUNTRIES & TERRITORIES</small></div>
        <i />
        <div><span>{mountainRanges.length}</span><small>MOUNTAIN SYSTEMS</small></div>
        <i />
        <div><span>3D</span><small>INTERACTIVE GLOBE</small></div>
      </div>

      {selectedCountry && (
        <aside className="country-card">
          <button className="close-card" onClick={() => onSelectCountry(null)} aria-label="Close country details"><X size={17} /></button>
          <span className="selected-label">SELECTED COUNTRY</span>
          <div className="country-card-title">
            <span className="flag-emoji">{selectedCountry.flag}</span>
            <div><h2>{selectedCountry.name}</h2><p>{selectedCountry.continent} · {selectedCountry.code}</p></div>
          </div>
          <dl>
            <div><dt>Population</dt><dd>{formatFull(selectedCountry.population)}</dd></div>
            <div><dt>Capital</dt><dd>{selectedCountry.capital}</dd></div>
            <div><dt>Average elevation</dt><dd>{formatFull(selectedCountry.averageElevation)} m</dd></div>
            <div><dt>Coastline</dt><dd>{selectedCountry.landlocked ? 'Landlocked' : `${formatFull(selectedCountry.coastline)} km`}</dd></div>
          </dl>
          <div className="country-card-foot">
            <span>CAPITAL POP. EST.</span><strong>{formatNumber(selectedCountry.capitalPopulation)}</strong>
            <span>FLAG COLORS</span><strong>{selectedCountry.flagColors}</strong>
          </div>
        </aside>
      )}
    </section>
  );
}

function LayerToggle({ icon, label, detail, active, onClick }: { icon: React.ReactNode; label: string; detail: string; active: boolean; onClick: () => void }) {
  return (
    <button className={`layer-toggle ${active ? 'active' : ''}`} onClick={onClick} aria-pressed={active}>
      <span className="layer-icon">{icon}</span>
      <span><strong>{label}</strong><small>{detail}</small></span>
      <i><b /></i>
    </button>
  );
}
