export type TravelCategory = 'nature' | 'city' | 'coast' | 'study' | 'work';
export type ViewMode = 'globe' | 'timeline';
export type GlobeTheme = 'day' | 'night';

export interface TravelPoint {
  lat: number;
  lng: number;
  label: string;
}

export interface TravelPhoto {
  src: string;
  caption?: string;
  date?: string;
  /** 照片留言，直接写在数据里，不依赖 localStorage */
  comment?: string;
}

export interface TravelMusic {
  title: string;
  artist: string;
  /** 本地路径如 /audio/tokyo-2024/bgm.mp3，或外链 URL */
  url: string;
  /** 环境音，播放 1~2 秒后渐变切到 url */
  ambientUrl?: string;
}

export interface Travel {
  id: string;
  title: string;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  days: number;
  category: TravelCategory;
  /** 不填则按 category 自动取色 */
  color?: string;
  origin: TravelPoint;
  destination: TravelPoint;
  distanceKm: number;
  moodTags: string[];
  /** 旅行搭子 */
  companions?: string[];
  note: string;
  photos: TravelPhoto[];
  music: TravelMusic;
}

export interface PassportStats {
  totalTrips: number;
  totalCities: number;
  totalDistanceKm: number;
  totalDays: number;
}
