import type { Travel } from '../types/travel';

export const demoTravels: Travel[] = [
  {
    id: 'tokyo-2024',
    title: '东京霓虹夜',
    city: '东京',
    country: '日本',
    startDate: '2024-03-12',
    endDate: '2024-03-18',
    days: 7,
    category: 'city',
    origin: { lat: 31.2304, lng: 121.4737, label: '上海' },
    destination: { lat: 35.6762, lng: 139.6503, label: '东京' },
    distanceKm: 1780,
    moodTags: ['🎒 特种兵暴走', '☕ 治愈放空', '🥐 碳水狂欢'],
    note: '涩谷十字路口的人潮、深夜拉面店的蒸汽，还有在台场看海风的那个傍晚，构成了我对这座城市的全部记忆。',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
        caption: '涩谷十字路口',
        date: '2024-03-14',
      },
      {
        src: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?auto=format&fit=crop&w=800&q=80',
        caption: '台场海滨',
        date: '2024-03-16',
      },
      {
        src: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
        caption: '深夜拉面',
        date: '2024-03-15',
      },
    ],
    music: {
      title: 'Plastic Love',
      artist: 'Mariya Takeuchi',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      ambientUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    },
  },
  {
    id: 'bali-2023',
    title: '巴厘岛追浪',
    city: '乌鲁瓦图',
    country: '印度尼西亚',
    startDate: '2023-08-02',
    endDate: '2023-08-10',
    days: 9,
    category: 'coast',
    origin: { lat: 31.2304, lng: 121.4737, label: '上海' },
    destination: { lat: -8.8291, lng: 115.084, label: '巴厘岛' },
    distanceKm: 5200,
    moodTags: ['🌊 看海放空', '🌧️ 雨天微凉'],
    note: '悬崖边的日落、冲浪板上的失重感，以及雨季后空气里潮湿的盐味，那是我第一次真正学会什么都不做。',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1537996192671-8d9a33212e95?auto=format&fit=crop&w=800&q=80',
        caption: '乌鲁瓦图悬崖',
      },
      {
        src: 'https://images.unsplash.com/photo-1518548419970-58e3b4079b2f?auto=format&fit=crop&w=800&q=80',
        caption: '库塔海滩',
      },
    ],
    music: {
      title: 'Sunset Lover',
      artist: 'Petit Biscuit',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    },
  },
  {
    id: 'iceland-2022',
    title: '冰岛极光',
    city: '雷克雅未克',
    country: '冰岛',
    startDate: '2022-11-05',
    endDate: '2022-11-12',
    days: 8,
    category: 'nature',
    origin: { lat: 48.8566, lng: 2.3522, label: '巴黎' },
    destination: { lat: 64.1466, lng: -21.9426, label: '雷克雅未克' },
    distanceKm: 2240,
    moodTags: ['🌧️ 雨天微凉', '🎒 特种兵暴走'],
    note: '黑沙滩、瀑布、地热泉，还有凌晨三点在荒原上看到的绿色光带，像宇宙在耳边呼吸。',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?auto=format&fit=crop&w=800&q=80',
        caption: '斯科加瀑布',
      },
      {
        src: 'https://images.unsplash.com/photo-1531168556467-80aace0d2462?auto=format&fit=crop&w=800&q=80',
        caption: '极光',
        date: '2022-11-08',
      },
    ],
    music: {
      title: 'Holocene',
      artist: 'Bon Iver',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    },
  },
];
