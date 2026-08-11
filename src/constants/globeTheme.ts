import type { GlobeTheme } from '../types/travel';

export interface GlobeThemeConfig {
  globeImageUrl: string;
  backgroundImageUrl: string | null;
  atmosphereColor: string;
  atmosphereAltitude: number;
  pageGradient: string;
}

export const globeThemes: Record<GlobeTheme, GlobeThemeConfig> = {
  night: {
    globeImageUrl: 'https://unpkg.com/three-globe/example/img/earth-night.jpg',
    backgroundImageUrl: 'https://unpkg.com/three-globe/example/img/night-sky.png',
    atmosphereColor: '#38bdf8',
    atmosphereAltitude: 0.18,
    pageGradient: 'radial-gradient(circle at top, #121a3a 0%, #050816 55%, #02040a 100%)',
  },
  day: {
    globeImageUrl: 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    backgroundImageUrl: null,
    atmosphereColor: '#7dd3fc',
    atmosphereAltitude: 0.15,
    pageGradient:
      'radial-gradient(circle at top, #f7fffd 0%, #d9f4ff 28%, #bfe5f6 58%, #d6edf5 100%)',
  },
};
