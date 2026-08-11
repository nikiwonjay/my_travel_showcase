import type { Travel, TravelPhoto } from '../types/travel';
import { getTravelColor } from '../constants/categories';

/** 规范化照片路径：支持 /photos/... 本地路径或 https:// 外链 */
export function resolveMediaUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    return path;
  }
  return path.startsWith('/') ? path : `/${path}`;
}

export function normalizePhotos(photos: TravelPhoto[]): TravelPhoto[] {
  return photos.map((photo) => ({
    ...photo,
    src: resolveMediaUrl(photo.src),
  }));
}

/** 检测是否网易云音乐链接 */
export function isNetEaseUrl(url: string): boolean {
  return /music\.163\.com/.test(url);
}

/** 检测是否网易云短链（需要手动转成完整链接） */
export function isNetEaseShortUrl(url: string): boolean {
  return /163cn\.tv/.test(url);
}

/** 从网易云链接中提取歌曲/歌单/电台 ID */
export function extractNetEaseId(url: string): { type: string; id: string } | null {
  // 从查询参数中提取 id（兼容 #/program?id=xxx 和 /song?id=xxx 等格式）
  const idMatch = url.match(/[?&]id=(\d+)/);
  const id = idMatch ? idMatch[1] : null;

  // 路径中的数字 ID（兼容 /song/123456 格式）
  const pathIdMatch = url.match(/\/(\d+)\/?$/);
  const pathId = pathIdMatch ? pathIdMatch[1] : null;

  if (/music\.163\.com\/#?\/*song/.test(url)) {
    return { type: 'song', id: id || pathId || '' };
  }
  if (/music\.163\.com\/#?\/*playlist/.test(url)) {
    return { type: 'playlist', id: id || pathId || '' };
  }
  if (/music\.163\.com\/#?\/*(?:radio|dj|djradio|program)/.test(url)) {
    return { type: 'radio', id: id || pathId || '' };
  }
  if (/music\.163\.com\/#?\/*album/.test(url)) {
    return { type: 'album', id: id || pathId || '' };
  }

  return null;
}

/** 获取音乐链接对应的 embed 播放器 iframe URL（支持网易云和普通 mp3） */
export function getMusicEmbedHtml(url: string): { type: 'iframe' | 'audio'; src: string } | null {
  if (!url) return null;

  // 网易云音乐 → iframe 嵌入
  const info = extractNetEaseId(url);
  if (info) {
    return { type: 'iframe', src: getNetEaseEmbedUrl(info.type, info.id, 1) };
  }

  // 其他直链 → audio 元素
  return { type: 'audio', src: url };
}

/** 获取网易云外链 mp3 地址（不一定可用，受版权和防盗链影响） */
export function getNetEaseMp3Url(songId: string): string {
  return `https://music.163.com/song/media/outer/url?id=${songId}.mp3`;
}

/** 获取网易云 iframe 嵌入地址 */
export function getNetEaseEmbedUrl(type: string, id: string, auto = 0): string {
  const typeMap: Record<string, number> = { song: 2, playlist: 0, album: 1, radio: 3, program: 3 };
  return `//music.163.com/outchain/player?type=${typeMap[type] ?? 2}&id=${id}&auto=${auto}&height=66`;
}

export function withResolvedMedia(travel: Travel): Travel {
  return {
    ...travel,
    color: getTravelColor(travel.category, travel.color),
    photos: normalizePhotos(travel.photos),
    music: {
      ...travel.music,
      url: resolveMediaUrl(travel.music.url),
      ambientUrl: travel.music.ambientUrl
        ? resolveMediaUrl(travel.music.ambientUrl)
        : undefined,
    },
  };
}
