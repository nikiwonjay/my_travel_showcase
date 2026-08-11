declare module 'globe.gl' {
  import type { Object3D } from 'three';

  interface GlobeInstance {
    globeImageUrl(url: string): GlobeInstance;
    backgroundImageUrl(url: string): GlobeInstance;
    showAtmosphere(show: boolean): GlobeInstance;
    atmosphereColor(color: string): GlobeInstance;
    atmosphereAltitude(alt: number): GlobeInstance;
    pointLat(accessor: string): GlobeInstance;
    pointLng(accessor: string): GlobeInstance;
    pointAltitude(accessor: number | string): GlobeInstance;
    pointRadius(accessor: string | number): GlobeInstance;
    pointColor(accessor: string | ((d: unknown) => string)): GlobeInstance;
    pointsMerge(merge: boolean): GlobeInstance;
    pointsData(data: unknown[]): GlobeInstance;
    arcStartLat(accessor: string): GlobeInstance;
    arcStartLng(accessor: string): GlobeInstance;
    arcEndLat(accessor: string): GlobeInstance;
    arcEndLng(accessor: string): GlobeInstance;
    arcColor(accessor: string | ((d: unknown) => string[])): GlobeInstance;
    arcAltitude(alt: number): GlobeInstance;
    arcStroke(stroke: number): GlobeInstance;
    arcDashLength(length: number): GlobeInstance;
    arcDashGap(gap: number): GlobeInstance;
    arcDashAnimateTime(ms: number): GlobeInstance;
    arcsData(data: unknown[]): GlobeInstance;
    onPointClick(cb: (point: unknown, event: MouseEvent, coords: { lat: number; lng: number; altitude: number }) => void): GlobeInstance;
    pointOfView(pov: { lat?: number; lng?: number; altitude?: number }, transitionMs?: number): GlobeInstance;
    controls(): {
      autoRotate: boolean;
      autoRotateSpeed: number;
      enableZoom: boolean;
    };
    scene(): Object3D;
  }

  export default function Globe(): (element: HTMLElement) => GlobeInstance;
}
