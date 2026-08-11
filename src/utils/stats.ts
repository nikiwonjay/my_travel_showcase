import type { PassportStats, Travel } from '../types/travel';

const EARTH_CIRCUMFERENCE_KM = 40075;

export function computePassportStats(travelList: Travel[]): PassportStats {
  const cities = new Set(travelList.map((t) => t.city));

  return {
    totalTrips: travelList.length,
    totalCities: cities.size,
    totalDistanceKm: travelList.reduce((sum, t) => sum + t.distanceKm, 0),
    totalDays: travelList.reduce((sum, t) => sum + t.days, 0),
  };
}

export function formatEarthLaps(km: number): string {
  const laps = km / EARTH_CIRCUMFERENCE_KM;
  return laps.toFixed(1);
}

export function formatDateRange(start: string, end: string): string {
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  return `${formatter.format(new Date(start))} — ${formatter.format(new Date(end))}`;
}

export function pickRandomTravel(travelList: Travel[]): Travel {
  return travelList[Math.floor(Math.random() * travelList.length)];
}
