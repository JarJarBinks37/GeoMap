import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import ThreeGlobe from 'three-globe';
import { feature } from 'topojson-client';
import world from 'world-atlas/countries-110m.json';
import {
  countries,
  countriesByNumericCode,
  type Country,
} from '../data/countries';

interface GlobeCanvasProps {
  selectedCountry: Country | null;
  onSelectCountry: (country: Country) => void;
  mountains: boolean;
  labels: boolean;
  borders: boolean;
  atmosphere: boolean;
  autoRotate: boolean;
  relief: number;
  resetSignal: number;
  zoomSignal: number;
}

interface GeoFeature {
  id: string | number;
  properties: { name?: string };
  geometry: unknown;
}

const topology = world as unknown as {
  objects: { countries: object };
};

const geoFeatures = (
  feature(topology as never, topology.objects.countries as never) as unknown as { features: GeoFeature[] }
).features;

export function GlobeCanvas({
  selectedCountry,
  onSelectCountry,
  mountains,
  labels,
  borders,
  atmosphere,
  autoRotate,
  relief,
  resetSignal,
  zoomSignal,
}: GlobeCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<ThreeGlobe | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const selectRef = useRef(onSelectCountry);

  useEffect(() => {
    selectRef.current = onSelectCountry;
  }, [onSelectCountry]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 1600);
    camera.position.set(0, 25, 315);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const globe = new ThreeGlobe()
      .showAtmosphere(true)
      .atmosphereColor('#78bca9')
      .atmosphereAltitude(0.16)
      .showGraticules(false)
      .polygonsData(geoFeatures);

    const globeMaterial = globe.globeMaterial() as THREE.MeshPhongMaterial;
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(`${import.meta.env.BASE_URL}textures/earth.jpg`);
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    const elevationTexture = textureLoader.load(`${import.meta.env.BASE_URL}textures/elevation.png`);
    globeMaterial.map = earthTexture;
    globeMaterial.bumpMap = elevationTexture;
    globeMaterial.bumpScale = 1.5;
    globeMaterial.color = new THREE.Color('#ffffff');
    globeMaterial.shininess = 4;
    globeMaterial.needsUpdate = true;

    globe
      .labelLat((item: Country) => item.lat)
      .labelLng((item: Country) => item.lng)
      .labelText((item: Country) => item.code)
      .labelColor(() => '#e8e0ce')
      .labelSize((item: Country) => (item.population > 80_000_000 ? 0.72 : 0.5))
      .labelDotRadius(0.24)
      .labelAltitude(0.025);

    scene.add(globe);
    scene.add(new THREE.HemisphereLight('#dff8ef', '#07100e', 2.1));
    const sunlight = new THREE.DirectionalLight('#ffdba0', 3.4);
    sunlight.position.set(-160, 120, 180);
    scene.add(sunlight);
    const rim = new THREE.DirectionalLight('#6caee0', 1.8);
    rim.position.set(180, -30, -140);
    scene.add(rim);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.enablePan = false;
    controls.minDistance = 155;
    controls.maxDistance = 430;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.46;
    controlsRef.current = controls;

    globeRef.current = globe;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDown = { x: 0, y: 0 };
    const onPointerDown = (event: PointerEvent) => {
      pointerDown = { x: event.clientX, y: event.clientY };
    };
    const onPointerUp = (event: PointerEvent) => {
      if (Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) > 6) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(globe, true);
      for (const hit of hits) {
        let object: THREE.Object3D | null = hit.object;
        while (object && object !== globe) {
          const boundData = (object as THREE.Object3D & { __data?: { data?: GeoFeature } }).__data;
          const geoFeature = boundData?.data;
          if (geoFeature) {
            const country = countriesByNumericCode.get(Number(geoFeature.id));
            if (country) selectRef.current(country);
            return;
          }
          object = object.parent;
        }
      }
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    let animationFrame = 0;
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.dispose();
      earthTexture.dispose();
      elevationTexture.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const globe = globeRef.current;
    const controls = controlsRef.current;
    if (!globe || !controls) return;
    controls.autoRotate = autoRotate;
    const material = globe.globeMaterial() as THREE.MeshPhongMaterial;
    material.bumpScale = mountains ? relief * 1.5 : 0;
    globe
      .showAtmosphere(atmosphere)
      .polygonCapColor((item: GeoFeature) => {
        const country = countriesByNumericCode.get(Number(item.id));
        return country?.code === selectedCountry?.code ? 'rgba(244, 226, 164, 0.28)' : 'rgba(0,0,0,0)';
      })
      .polygonSideColor(() => 'rgba(0,0,0,0)')
      .polygonStrokeColor(() => (borders ? 'rgba(229, 238, 220, 0.54)' : 'rgba(0,0,0,0)'))
      .polygonAltitude(0.002)
      .labelsData(
        labels
          ? countries.filter((country) => country.population > 18_000_000 || country.code === selectedCountry?.code)
          : [],
      );
  }, [atmosphere, autoRotate, borders, labels, mountains, relief, selectedCountry]);

  const lastZoom = useRef(zoomSignal);
  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls || zoomSignal === lastZoom.current) return;
    const factor = zoomSignal > lastZoom.current ? 0.8 : 1.25;
    camera.position.setLength(THREE.MathUtils.clamp(camera.position.length() * factor, controls.minDistance, controls.maxDistance));
    lastZoom.current = zoomSignal;
    controls.update();
  }, [zoomSignal]);

  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    camera.position.set(0, 25, 315);
    controls.target.set(0, 0, 0);
    controls.update();
  }, [resetSignal]);

  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!selectedCountry || !camera || !controls) return;
    const globe = globeRef.current;
    if (!globe) return;
    const coords = globe.getCoords(selectedCountry.lat, selectedCountry.lng, 1.9);
    camera.position.set(coords.x, coords.y, coords.z);
    controls.target.set(0, 0, 0);
    controls.update();
  }, [selectedCountry]);

  return <div className="globe-canvas" ref={mountRef} aria-label="Interactive three-dimensional globe" />;
}
