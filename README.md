# Country Club — World Field Guide

An interactive geographic explorer with a tactile 3D globe and sortable country index.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:4173`.

## Validate

```bash
npm run build
npx playwright test
```

The browser tests use Chromium installed at `/usr/bin/chromium` in the Codex cloud environment.

## Data notes

Country, population, elevation, coastline, and flag data are bundled from the installed reference datasets so the app does not depend on a runtime API. Capital populations are clearly marked as rounded prototype estimates. Geographic figures can vary by source and methodology.

Globe imagery and elevation texture are bundled from the three-globe example assets. The terrain layer uses an exaggerated elevation displacement map and shaded relief.
