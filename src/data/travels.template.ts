import type { Travel } from '../types/travel';

/**
 * 复制此模板，粘贴到 travels.personal.ts 的 personalTravels 数组中。
 * 推荐直接从 starterTravel 开始复制，这个文件主要作为字段参考保留。
 */
export const travelEntryTemplate: Travel = {
  id: 'city-year',
  title: '旅程标题',
  city: '目的地城市',
  country: '国家',
  startDate: '2024-01-01',
  endDate: '2024-01-07',
  days: 7,
  category: 'city',
  origin: { lat: 0, lng: 0, label: '出发城市' },
  destination: { lat: 0, lng: 0, label: '目的地城市' },
  distanceKm: 1000,
  moodTags: ['☕ 治愈放空'],
  note: '写一段当时的心情和回忆…',
  photos: [
    {
      src: '/photos/city-year/01.jpg',
      caption: '打卡地点',
      date: '2024-01-03',
    },
  ],
  music: {
    title: '歌名',
    artist: '歌手',
    url: '/audio/city-year/bgm.mp3',
    ambientUrl: '/audio/city-year/ambient.mp3',
  },
};
