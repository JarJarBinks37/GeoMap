/// <reference types="vite/client" />

declare module 'world-countries' {
  const countries: RawCountry[];
  export default countries;
}

declare module 'three-globe' {
  import { Object3D, Material } from 'three';
  export default class ThreeGlobe extends Object3D {
    globeMaterial(): Material;
    globeCurvatureResolution(value: number): this;
    showAtmosphere(value?: boolean): this;
    atmosphereColor(value?: string): this;
    atmosphereAltitude(value?: number): this;
    showGraticules(value?: boolean): this;
    polygonsData(value?: object[]): this;
    polygonAltitude(value?: number | ((item: any) => number)): this;
    polygonCapColor(value?: string | ((item: any) => string)): this;
    polygonSideColor(value?: string | ((item: any) => string)): this;
    polygonStrokeColor(value?: string | ((item: any) => string)): this;
    polygonLabel(value?: string | ((item: any) => string)): this;
    onPolygonClick(value?: (item: any) => void): this;
    labelsData(value?: object[]): this;
    labelLat(value?: string | ((item: any) => number)): this;
    labelLng(value?: string | ((item: any) => number)): this;
    labelText(value?: string | ((item: any) => string)): this;
    labelColor(value?: string | ((item: any) => string)): this;
    labelSize(value?: number | ((item: any) => number)): this;
    labelAltitude(value?: number | ((item: any) => number)): this;
    labelDotRadius(value?: number | ((item: any) => number)): this;
    pathsData(value?: object[]): this;
    pathColor(value?: string | ((item: any) => string)): this;
    pathStroke(value?: number): this;
    pathPointAlt(value?: number): this;
    customLayerData(value?: object[]): this;
    customThreeObject(value?: (item: any) => Object3D): this;
    customThreeObjectUpdate(value?: (object: Object3D, item: any) => void): this;
    getCoords(lat: number, lng: number, altitude?: number): { x: number; y: number; z: number };
  }
}

interface RawCountry {
  name: { common: string; official: string };
  cca2: string;
  cca3: string;
  ccn3?: string;
  capital?: string[];
  region: string;
  subregion?: string;
  population?: number;
  area: number;
  landlocked: boolean;
  latlng?: [number, number];
  flag: string;
  independent?: boolean;
  unMember?: boolean;
  status: string;
  capitalInfo?: { latlng?: [number, number] };
}
