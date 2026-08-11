import type { Travel } from '../types/travel';
import { demoTravels } from './travels.demo';
import { personalTravels } from './travels.personal';
import { withResolvedMedia } from '../utils/media';

const STORAGE_KEY = 'user-travels';

function loadUserTravels(): Travel[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Travel[];
  } catch {
    return [];
  }
}

export function saveUserTravel(travel: Travel): boolean {
  try {
    const existing = loadUserTravels();
    const idx = existing.findIndex((t) => t.id === travel.id);
    if (idx >= 0) {
      existing[idx] = travel;
    } else {
      existing.push(travel);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    return true;
  } catch {
    return false;
  }
}

export function updateUserTravel(travel: Travel): boolean {
  return saveUserTravel(travel);
}

export function getAllTravels(): Travel[] {
  const base = personalTravels.length > 0 ? personalTravels : demoTravels;
  const user = loadUserTravels();
  return [...base, ...user].map(withResolvedMedia);
}

export const travels: Travel[] = getAllTravels();
export const isUsingDemoTravels = personalTravels.length === 0 && loadUserTravels().length === 0;

/** @deprecated 请从 constants/categories 导入 */
export { categoryLabels } from '../constants/categories';
