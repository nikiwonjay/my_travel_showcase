import type { TravelCategory } from '../types/travel';

export const categoryLabels: Record<TravelCategory, string> = {
  nature: '自然探险',
  city: '城市漫步',
  coast: '看海放空',
  study: '求学',
  work: '出差',
};

export const categoryColors: Record<TravelCategory, string> = {
  nature: '#a78bfa',
  city: '#fb923c',
  coast: '#22d3ee',
  study: '#4ade80',
  work: '#f472b6',
};

export function getTravelColor(category: TravelCategory, override?: string): string {
  return override ?? categoryColors[category];
}
