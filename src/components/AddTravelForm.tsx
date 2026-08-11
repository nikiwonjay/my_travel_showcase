import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { Travel, TravelCategory, TravelPhoto } from '../types/travel';
import ConfirmDialog from './ConfirmDialog';

interface AddTravelFormProps {
  onSave: (travel: Travel) => void;
  onClose: () => void;
  editTravel?: Travel | null;
  isSaving?: boolean;
}

const categoryOptions: { value: TravelCategory; label: string }[] = [
  { value: 'city', label: '城市漫步' },
  { value: 'nature', label: '自然探险' },
  { value: 'coast', label: '看海放空' },
  { value: 'study', label: '求学交流' },
  { value: 'work', label: '出差工作' },
];

const cityCoords: Record<string, { lat: number; lng: number }> = {
  // 一线城市 + 直辖市
  上海: { lat: 31.23, lng: 121.47 },
  北京: { lat: 39.9, lng: 116.4 },
  广州: { lat: 23.13, lng: 113.26 },
  深圳: { lat: 22.54, lng: 114.06 },
  天津: { lat: 39.08, lng: 117.2 },
  重庆: { lat: 29.56, lng: 106.55 },
  // 华东
  杭州: { lat: 30.27, lng: 120.15 },
  南京: { lat: 32.06, lng: 118.8 },
  苏州: { lat: 31.3, lng: 120.59 },
  无锡: { lat: 31.49, lng: 120.31 },
  常州: { lat: 31.77, lng: 119.95 },
  扬州: { lat: 32.39, lng: 119.41 },
  南通: { lat: 31.98, lng: 120.89 },
  厦门: { lat: 24.48, lng: 118.09 },
  福州: { lat: 26.07, lng: 119.31 },
  泉州: { lat: 24.87, lng: 118.68 },
  武夷山: { lat: 27.75, lng: 117.68 },
  霞浦: { lat: 26.88, lng: 120.0 },
  青岛: { lat: 36.07, lng: 120.38 },
  烟台: { lat: 37.54, lng: 121.4 },
  威海: { lat: 37.51, lng: 122.12 },
  济南: { lat: 36.65, lng: 117.12 },
  泰山: { lat: 36.25, lng: 117.1 },
  宁波: { lat: 29.87, lng: 121.55 },
  温州: { lat: 27.99, lng: 120.65 },
  绍兴: { lat: 30.0, lng: 120.58 },
  嘉兴: { lat: 30.75, lng: 120.75 },
  金华: { lat: 29.08, lng: 119.65 },
  合肥: { lat: 31.82, lng: 117.23 },
  黄山: { lat: 29.71, lng: 118.34 },
  宏村: { lat: 29.92, lng: 117.98 },
  // 华中
  武汉: { lat: 30.59, lng: 114.31 },
  长沙: { lat: 28.23, lng: 112.94 },
  张家界: { lat: 29.13, lng: 110.48 },
  凤凰: { lat: 27.95, lng: 109.6 },
  衡山: { lat: 27.3, lng: 112.66 },
  郑州: { lat: 34.76, lng: 113.62 },
  开封: { lat: 34.8, lng: 114.31 },
  洛阳: { lat: 34.62, lng: 112.45 },
  宜昌: { lat: 30.69, lng: 111.28 },
  神农架: { lat: 31.74, lng: 110.67 },
  南昌: { lat: 28.68, lng: 115.86 },
  景德镇: { lat: 29.27, lng: 117.18 },
  婺源: { lat: 29.25, lng: 117.86 },
  // 华南
  南宁: { lat: 22.82, lng: 108.32 },
  桂林: { lat: 25.27, lng: 110.29 },
  阳朔: { lat: 24.78, lng: 110.5 },
  北海: { lat: 21.48, lng: 109.12 },
  海口: { lat: 20.02, lng: 110.35 },
  三亚: { lat: 18.25, lng: 109.51 },
  万宁: { lat: 18.8, lng: 110.39 },
  文昌: { lat: 19.54, lng: 110.8 },
  澳门: { lat: 22.2, lng: 113.54 },
  台北: { lat: 25.03, lng: 121.57 },
  台中: { lat: 24.15, lng: 120.67 },
  // 西南
  成都: { lat: 30.57, lng: 104.07 },
  九寨沟: { lat: 33.26, lng: 103.92 },
  稻城: { lat: 29.04, lng: 100.3 },
  乐山: { lat: 29.55, lng: 103.77 },
  昆明: { lat: 24.88, lng: 102.83 },
  大理: { lat: 25.61, lng: 100.27 },
  丽江: { lat: 26.86, lng: 100.22 },
  香格里拉: { lat: 27.83, lng: 99.71 },
  腾冲: { lat: 25.02, lng: 98.49 },
  西双版纳: { lat: 22.0, lng: 100.8 },
  拉萨: { lat: 29.65, lng: 91.17 },
  日喀则: { lat: 29.27, lng: 88.88 },
  贵阳: { lat: 26.65, lng: 106.71 },
  遵义: { lat: 27.73, lng: 106.91 },
  // 西北
  西安: { lat: 34.26, lng: 108.94 },
  兰州: { lat: 36.06, lng: 103.83 },
  张掖: { lat: 38.93, lng: 100.45 },
  敦煌: { lat: 40.14, lng: 94.66 },
  西宁: { lat: 36.62, lng: 101.78 },
  青海湖: { lat: 36.92, lng: 100.18 },
  乌鲁木齐: { lat: 43.83, lng: 87.62 },
  喀什: { lat: 39.46, lng: 75.99 },
  伊宁: { lat: 43.92, lng: 81.31 },
  银川: { lat: 38.49, lng: 106.23 },
  // 华北
  太原: { lat: 37.87, lng: 112.55 },
  大同: { lat: 40.08, lng: 113.3 },
  平遥: { lat: 37.2, lng: 112.17 },
  五台山: { lat: 38.97, lng: 113.59 },
  呼和浩特: { lat: 40.84, lng: 111.75 },
  额济纳: { lat: 41.97, lng: 101.07 },
  秦皇岛: { lat: 39.94, lng: 119.59 },
  北戴河: { lat: 39.83, lng: 119.49 },
  承德: { lat: 40.95, lng: 117.96 },
  // 东北
  哈尔滨: { lat: 45.8, lng: 126.54 },
  漠河: { lat: 52.97, lng: 122.54 },
  牡丹江: { lat: 44.58, lng: 129.6 },
  长春: { lat: 43.82, lng: 125.33 },
  延吉: { lat: 42.91, lng: 129.51 },
  长白山: { lat: 42.03, lng: 128.05 },
  沈阳: { lat: 41.8, lng: 123.43 },
  大连: { lat: 38.91, lng: 121.6 },
  丹东: { lat: 40.13, lng: 124.39 },
  // 日韩
  首尔: { lat: 37.57, lng: 126.98 },
  釜山: { lat: 35.18, lng: 129.08 },
  济州岛: { lat: 33.5, lng: 126.53 },
  东京: { lat: 35.68, lng: 139.69 },
  大阪: { lat: 34.69, lng: 135.5 },
  京都: { lat: 35.01, lng: 135.77 },
  札幌: { lat: 43.06, lng: 141.35 },
  奈良: { lat: 34.69, lng: 135.8 },
  富士: { lat: 35.36, lng: 138.73 },
  冲绳: { lat: 26.33, lng: 127.8 },
  福冈: { lat: 33.59, lng: 130.4 },
  // 东南亚
  曼谷: { lat: 13.76, lng: 100.5 },
  清迈: { lat: 18.79, lng: 98.99 },
  普吉岛: { lat: 7.88, lng: 98.39 },
  苏梅岛: { lat: 9.5, lng: 100.0 },
  暹粒: { lat: 13.36, lng: 103.86 },
  金边: { lat: 11.55, lng: 104.92 },
  新加坡: { lat: 1.35, lng: 103.82 },
  吉隆坡: { lat: 3.14, lng: 101.69 },
  槟城: { lat: 5.42, lng: 100.33 },
  兰卡威: { lat: 6.35, lng: 99.8 },
  马尼拉: { lat: 14.6, lng: 120.98 },
  长滩岛: { lat: 11.95, lng: 121.93 },
  宿务: { lat: 10.32, lng: 123.89 },
  胡志明市: { lat: 10.82, lng: 106.63 },
  河内: { lat: 21.03, lng: 105.85 },
  岘港: { lat: 16.05, lng: 108.2 },
  芽庄: { lat: 12.24, lng: 109.2 },
  富国岛: { lat: 10.22, lng: 103.96 },
  琅勃拉邦: { lat: 19.88, lng: 102.13 },
  巴厘岛: { lat: -8.34, lng: 115.09 },
  雅加达: { lat: -6.21, lng: 106.85 },
  // 南亚
  新德里: { lat: 28.61, lng: 77.21 },
  孟买: { lat: 19.08, lng: 72.88 },
  班加罗尔: { lat: 12.97, lng: 77.59 },
  加尔各答: { lat: 22.57, lng: 88.36 },
  斋浦尔: { lat: 26.91, lng: 75.79 },
  瓦拉纳西: { lat: 25.32, lng: 83.01 },
  阿格拉: { lat: 27.18, lng: 78.02 },
  喀什米尔: { lat: 34.08, lng: 74.79 },
  加德满都: { lat: 27.7, lng: 85.32 },
  博卡拉: { lat: 28.21, lng: 83.99 },
  廷布: { lat: 27.47, lng: 89.64 },
  科伦坡: { lat: 6.93, lng: 79.86 },
  马累: { lat: 4.18, lng: 73.51 },
  // 中亚
  阿拉木图: { lat: 43.26, lng: 76.95 },
  塔什干: { lat: 41.3, lng: 69.24 },
  比什凯克: { lat: 42.87, lng: 74.59 },
  撒马尔罕: { lat: 39.65, lng: 66.97 },
  // 中东
  迪拜: { lat: 25.2, lng: 55.27 },
  阿布扎比: { lat: 24.45, lng: 54.38 },
  多哈: { lat: 25.29, lng: 51.53 },
  利雅得: { lat: 24.71, lng: 46.68 },
  伊斯坦布尔: { lat: 41.01, lng: 28.98 },
  安卡拉: { lat: 39.93, lng: 32.86 },
  开罗: { lat: 30.04, lng: 31.24 },
  亚历山大: { lat: 31.2, lng: 29.92 },
  特拉维夫: { lat: 32.07, lng: 34.78 },
  耶路撒冷: { lat: 31.78, lng: 35.22 },
  安曼: { lat: 31.95, lng: 35.93 },
  贝鲁特: { lat: 33.89, lng: 35.5 },
  德黑兰: { lat: 35.69, lng: 51.39 },
  // 大洋洲
  悉尼: { lat: -33.87, lng: 151.21 },
  墨尔本: { lat: -37.81, lng: 144.96 },
  黄金海岸: { lat: -28.0, lng: 153.43 },
  凯恩斯: { lat: -16.92, lng: 145.78 },
  珀斯: { lat: -31.95, lng: 115.86 },
  奥克兰: { lat: -36.85, lng: 174.76 },
  皇后镇: { lat: -45.03, lng: 168.66 },
  惠灵顿: { lat: -41.29, lng: 174.78 },
  斐济: { lat: -17.71, lng: 178.07 },
  // 欧洲
  巴黎: { lat: 48.86, lng: 2.35 },
  伦敦: { lat: 51.51, lng: -0.13 },
  爱丁堡: { lat: 55.95, lng: -3.19 },
  曼彻斯特: { lat: 53.48, lng: -2.24 },
  罗马: { lat: 41.9, lng: 12.5 },
  米兰: { lat: 45.46, lng: 9.19 },
  威尼斯: { lat: 45.44, lng: 12.32 },
  佛罗伦萨: { lat: 43.77, lng: 11.25 },
  那不勒斯: { lat: 40.85, lng: 14.27 },
  梵蒂冈: { lat: 41.9, lng: 12.45 },
  马德里: { lat: 40.42, lng: -3.7 },
  巴塞罗那: { lat: 41.39, lng: 2.17 },
  塞维利亚: { lat: 37.39, lng: -5.99 },
  里斯本: { lat: 38.72, lng: -9.14 },
  波尔图: { lat: 41.15, lng: -8.61 },
  阿姆斯特丹: { lat: 52.37, lng: 4.9 },
  鹿特丹: { lat: 51.92, lng: 4.48 },
  布鲁塞尔: { lat: 50.85, lng: 4.35 },
  卢森堡: { lat: 49.61, lng: 6.13 },
  柏林: { lat: 52.52, lng: 13.41 },
  慕尼黑: { lat: 48.14, lng: 11.58 },
  法兰克福: { lat: 50.11, lng: 8.68 },
  汉堡: { lat: 53.55, lng: 9.99 },
  苏黎世: { lat: 47.38, lng: 8.54 },
  日内瓦: { lat: 46.2, lng: 6.14 },
  伯尔尼: { lat: 46.95, lng: 7.45 },
  维也纳: { lat: 48.21, lng: 16.37 },
  萨尔茨堡: { lat: 47.81, lng: 13.04 },
  布拉格: { lat: 50.08, lng: 14.44 },
  雅典: { lat: 37.98, lng: 23.73 },
  圣托里尼: { lat: 36.39, lng: 25.46 },
  莫斯科: { lat: 55.76, lng: 37.62 },
  圣彼得堡: { lat: 59.93, lng: 30.32 },
  赫尔辛基: { lat: 60.17, lng: 24.94 },
  斯德哥尔摩: { lat: 59.33, lng: 18.07 },
  哥本哈根: { lat: 55.68, lng: 12.57 },
  奥斯陆: { lat: 59.91, lng: 10.75 },
  雷克雅未克: { lat: 64.13, lng: -21.95 },
  华沙: { lat: 52.23, lng: 21.01 },
  克拉科夫: { lat: 50.06, lng: 19.94 },
  布达佩斯: { lat: 47.5, lng: 19.04 },
  布加勒斯特: { lat: 44.43, lng: 26.1 },
  索菲亚: { lat: 42.7, lng: 23.32 },
  贝尔格莱德: { lat: 44.79, lng: 20.46 },
  萨拉热窝: { lat: 43.85, lng: 18.38 },
  杜布罗夫尼克: { lat: 42.65, lng: 18.09 },
  // 北美
  纽约: { lat: 40.71, lng: -74.01 },
  华盛顿: { lat: 38.91, lng: -77.04 },
  波士顿: { lat: 42.36, lng: -71.06 },
  费城: { lat: 39.95, lng: -75.17 },
  迈阿密: { lat: 25.76, lng: -80.19 },
  奥兰多: { lat: 28.54, lng: -81.38 },
  洛杉矶: { lat: 34.05, lng: -118.24 },
  旧金山: { lat: 37.77, lng: -122.42 },
  拉斯维加斯: { lat: 36.17, lng: -115.14 },
  圣迭戈: { lat: 32.72, lng: -117.16 },
  芝加哥: { lat: 41.88, lng: -87.63 },
  西雅图: { lat: 47.61, lng: -122.33 },
  丹佛: { lat: 39.74, lng: -104.99 },
  休斯顿: { lat: 29.76, lng: -95.37 },
  达拉斯: { lat: 32.78, lng: -96.8 },
  檀香山: { lat: 21.31, lng: -157.86 },
  温哥华: { lat: 49.28, lng: -123.12 },
  多伦多: { lat: 43.65, lng: -79.38 },
  蒙特利尔: { lat: 45.5, lng: -73.57 },
  渥太华: { lat: 45.42, lng: -75.7 },
  墨西哥城: { lat: 19.43, lng: -99.13 },
  坎昆: { lat: 21.16, lng: -86.85 },
  // 中美洲
  巴拿马城: { lat: 8.98, lng: -79.52 },
  哈瓦那: { lat: 23.13, lng: -82.38 },
  // 南美
  布宜诺斯艾利斯: { lat: -34.6, lng: -58.38 },
  里约热内卢: { lat: -22.91, lng: -43.17 },
  圣保罗: { lat: -23.55, lng: -46.63 },
  利马: { lat: -12.05, lng: -77.04 },
  库斯科: { lat: -13.53, lng: -71.97 },
  马丘比丘: { lat: -13.16, lng: -72.55 },
  圣地亚哥: { lat: -33.45, lng: -70.67 },
  复活节岛: { lat: -27.11, lng: -109.35 },
  波哥大: { lat: 4.71, lng: -74.07 },
  加拉帕戈斯: { lat: -0.79, lng: -90.31 },
  乌斯怀亚: { lat: -54.81, lng: -68.31 },
  // 非洲
  开普敦: { lat: -33.92, lng: 18.42 },
  约翰内斯堡: { lat: -26.2, lng: 28.05 },
  桑给巴尔: { lat: -6.16, lng: 39.2 },
  内罗毕: { lat: -1.29, lng: 36.82 },
  维多利亚瀑布: { lat: -17.92, lng: 25.86 },
  卡萨布兰卡: { lat: 33.57, lng: -7.59 },
  马拉喀什: { lat: 31.63, lng: -7.99 },
  非斯: { lat: 34.02, lng: -5.0 },
  拉巴特: { lat: 34.02, lng: -6.83 },
  突尼斯: { lat: 36.81, lng: 10.18 },
  卢克索: { lat: 25.69, lng: 32.64 },
  // 港澳
  香港: { lat: 22.32, lng: 114.17 },
};

// ============ 用户自定义城市（localStorage 持久化）============
// 流程：先查内置 250+ → 再查 localStorage → 都没有就调 Nominatim
// 这样第一次输入陌生城市要等一下，之后就秒开

const CUSTOM_CITY_KEY = 'my_travel_custom_cities';

type LatLng = { lat: number; lng: number };

function loadCustomCities(): Record<string, LatLng> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(CUSTOM_CITY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, LatLng>;
    // 简单校验：必须有数字 lat/lng
    Object.keys(parsed).forEach((key) => {
      const v = parsed[key];
      if (typeof v?.lat !== 'number' || typeof v?.lng !== 'number') {
        delete parsed[key];
      }
    });
    return parsed;
  } catch {
    return {};
  }
}

function saveCustomCity(name: string, coords: LatLng) {
  if (typeof window === 'undefined') return;
  const cities = loadCustomCities();
  cities[name.trim()] = coords;
  window.localStorage.setItem(CUSTOM_CITY_KEY, JSON.stringify(cities));
}

// 查任意城市：内置 + localStorage
function lookupCityCoords(city: string): LatLng | null {
  const trimmed = city.trim();
  if (!trimmed) return null;
  const builtin = cityCoords[trimmed];
  if (builtin) return builtin;
  const custom = loadCustomCities()[trimmed];
  if (custom) return custom;
  return null;
}

// 调 Nominatim 免费 API 查城市经纬度
// Nominatim 使用政策：最多 1 req/s，需要带 User-Agent（浏览器自动加）
async function fetchCoordsFromNominatim(city: string): Promise<LatLng | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
      {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(6000),
      },
    );
    if (!response.ok) return null;
    const data = (await response.json()) as Array<{ lat: string; lon: string }>;
    if (!Array.isArray(data) || data.length === 0) return null;
    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}

function calcDays(start: string, end: string): number {
  if (!start || !end) return 1;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.round(diff / 86400000) + 1);
}

// Haversine 公式：球面距离（公里），跨经纬度也准
// 之前的简化公式 (度数差 * 111) 在低纬度还行，跨高纬度误差能到 20%+
function estimateDistanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  if ((a.lat === 0 && a.lng === 0) || (b.lat === 0 && b.lng === 0)) return 0;
  const R = 6371; // 地球半径（公里）
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
}

async function compressImage(file: File): Promise<string> {
  const maxSize = 900;
  const scaleTarget = (w: number, h: number) => Math.min(1, maxSize / Math.max(w, h));

  let img: ImageBitmap | HTMLImageElement;
  try {
    img = await createImageBitmap(file, { resizeWidth: maxSize, resizeQuality: 'medium' });
  } catch {
    img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      const reader = new FileReader();
      reader.onload = () => { el.src = reader.result as string; };
      reader.onerror = () => reject(new Error('图片读取失败'));
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('图片读取失败'));
      try { reader.readAsDataURL(file); } catch { reject(new Error('图片读取失败')); }
    });
  }

  const canvas = document.createElement('canvas');
  const scale = img instanceof ImageBitmap ? 1 : scaleTarget(img.width, img.height);
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('图片压缩失败');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  if (img instanceof ImageBitmap) img.close();
  return canvas.toDataURL('image/jpeg', 0.62);
}

export default function AddTravelForm({ onSave, onClose, editTravel, isSaving = false }: AddTravelFormProps) {
  const isEditing = Boolean(editTravel);
  const [title, setTitle] = useState(editTravel?.title ?? '');
  const [city, setCity] = useState(editTravel?.city ?? '');
  const [country, setCountry] = useState(editTravel?.country ?? '');
  const [startDate, setStartDate] = useState(editTravel?.startDate ?? '');
  const [endDate, setEndDate] = useState(editTravel?.endDate ?? '');
  const [category, setCategory] = useState<TravelCategory>(editTravel?.category ?? 'city');
  const [originCity, setOriginCity] = useState(editTravel?.origin.label ?? '');
  const [companionsStr, setCompanionsStr] = useState(editTravel?.companions?.join('，') ?? '');
  const [moodTagsStr, setMoodTagsStr] = useState(editTravel?.moodTags.join('，') ?? '');
  const [note, setNote] = useState(editTravel?.note ?? '');
  // 音乐 URL：
  //   正常情况 = https://... 链接（外链）或者 ''（空）
  //   脏数据情况 = data:video/mp4;base64,... （老代码 bug 写进去的 base64）
  //   脏数据时不要填到外链输入框，会显示一长串 base64，让用户以为变成链接了
  //   改成检测到 data: 时 musicFileName 显示一个提示
  const [musicUrl, setMusicUrl] = useState(
    editTravel?.music.url && !editTravel.music.url.startsWith('data:')
      ? editTravel.music.url
      : '',
  );
  const [musicFileName, setMusicFileName] = useState<string | null>(() => {
    if (editTravel?.music.url?.startsWith('data:')) {
      return '⚠️ 老数据需重新上传音频';
    }
    return null;
  });
  const [photos, setPhotos] = useState<TravelPhoto[]>(editTravel?.photos ?? []);
  // 距离（公里）：默认填 Haversine 算出来的估算值，用户可以手动改
  const [distanceStr, setDistanceStr] = useState(
    editTravel?.distanceKm ? String(editTravel.distanceKm) : '',
  );
  const [isCompressing, setIsCompressing] = useState(false);
  const [isMusicReading, setIsMusicReading] = useState(false);
  const [isDraggingMusic, setIsDraggingMusic] = useState(false);
  // 触发 re-render 的版本号：localStorage 变化时 +1
  const [customCityVersion, setCustomCityVersion] = useState(0);
  // 当前正在自动查询的城市
  const [resolvingCity, setResolvingCity] = useState<string | null>(null);
  // 等待用户确认的删除操作（'photo' | 'music' | null）
  const [pendingDelete, setPendingDelete] = useState<
    | { type: 'photo'; index: number; caption?: string }
    | { type: 'music'; fileName: string }
    | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const musicInputRef = useRef<HTMLInputElement>(null);

  const addPhotoFiles = async (files: File[]) => {
    setIsCompressing(true);
    try {
      const nextPhotos = await Promise.all(
        files.map(async (file) => ({
          src: await compressImage(file),
          caption: file.name.replace(/\.[^.]+$/, ''),
        })),
      );
      setPhotos((prev) => [...prev, ...nextPhotos]);
    } catch {
      alert('有图片处理失败了，请换一张或先压缩后再上传');
    } finally {
      setIsCompressing(false);
    }
  };

  // 实时估算公里数：用户输入出发城市 / 目的地时立刻算
  // 城市可能来自三处：内置 250+ / localStorage 自定义 / Nominatim 自动查
  const liveOrigin = (() => {
    if (originCity === editTravel?.origin.label) return editTravel.origin;
    return lookupCityCoords(originCity) ?? { lat: 0, lng: 0 };
  })();
  const liveDest = (() => {
    if (city === editTravel?.city) return editTravel.destination;
    return lookupCityCoords(city) ?? { lat: 0, lng: 0 };
  })();
  const liveDistance = estimateDistanceKm(liveOrigin, liveDest);

  // 自动查询陌生城市：Nominatim 免费 API
  useEffect(() => {
    const candidates = [originCity, city]
      .map((c) => c.trim())
      .filter((c) => c.length > 0 && c !== editTravel?.city && c !== editTravel?.origin.label);
    for (const name of candidates) {
      if (lookupCityCoords(name)) continue; // 已存在
      setResolvingCity(name);
      // eslint-disable-next-line no-void
      void (async () => {
        const coords = await fetchCoordsFromNominatim(name);
        if (coords) {
          saveCustomCity(name, coords);
          setCustomCityVersion((v) => v + 1);
        }
        setResolvingCity((cur) => (cur === name ? null : cur));
      })();
      // 一次只查一个，避免 Nominatim 1 req/s 限流
      return;
    }
    setResolvingCity(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originCity, city, customCityVersion]);

  const handleMusicFile = async (file: File) => {
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|m4a|mp4|wav|ogg)$/i)) {
      alert('这个文件不是音频哦，请选择 mp3、m4a、mp4、wav 或 ogg 文件');
      return;
    }
    // 单文件大于 8MB 时 base64 拼接会很慢且会塞爆 localStorage，提前提示
    if (file.size > 8 * 1024 * 1024) {
      const ok = window.confirm(
        `音频文件 ${file.name} 有 ${(file.size / 1024 / 1024).toFixed(1)}MB，会被转成 base64 存进云端，可能比较慢。\n继续吗？`,
      );
      if (!ok) return;
    }
    setIsMusicReading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('音频读取失败'));
        reader.readAsDataURL(file);
      });
      setMusicUrl(dataUrl);
      setMusicFileName(file.name);
    } catch {
      alert('音频文件读取失败，请换一个小一点的文件或粘贴 mp3 外链');
    } finally {
      setIsMusicReading(false);
    }
  };

  const handlePhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsCompressing(true);
    try {
      const nextPhotos = await Promise.all(
        Array.from(files).map(async (file) => ({
          src: await compressImage(file),
          caption: file.name.replace(/\.[^.]+$/, ''),
        })),
      );
      setPhotos((prev) => [...prev, ...nextPhotos]);
    } catch {
      alert('有图片处理失败了，请换一张或先压缩后再上传');
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const missing: string[] = [];
    if (!title.trim()) missing.push('旅程标题');
    if (!city.trim()) missing.push('目的地城市');
    if (!country.trim()) missing.push('国家');
    if (missing.length > 0) {
      alert(`还差这几个没填：${missing.join('、')}\n（带 * 的是必填的）`);
      return;
    }

    const id = editTravel?.id ?? `trip-${Date.now()}`;
    const days = calcDays(startDate, endDate);
    const origin =
      originCity === editTravel?.origin.label
        ? editTravel.origin
        : { ...(lookupCityCoords(originCity) ?? { lat: 0, lng: 0 }) };
    const dest =
      city === editTravel?.city
        ? editTravel.destination
        : { ...(lookupCityCoords(city) ?? { lat: 0, lng: 0 }) };
    const companions = companionsStr.split(/[,，]/).map((s) => s.trim()).filter(Boolean);

    // 距离：优先用用户手动填的，否则用 Haversine 估算
    const parsedDistance = Number.parseInt(distanceStr, 10);
    const distanceKm = Number.isFinite(parsedDistance) && parsedDistance >= 0
      ? parsedDistance
      : estimateDistanceKm(origin, dest);

    const travel: Travel = {
      id,
      title: title.trim(),
      city: city.trim(),
      country: country.trim(),
      startDate: startDate || new Date().toISOString().slice(0, 10),
      endDate: endDate || startDate || new Date().toISOString().slice(0, 10),
      days,
      category,
      origin: { ...origin, label: originCity || '出发地' },
      destination: { ...dest, label: city },
      distanceKm,
      moodTags: moodTagsStr.split(/[,，]/).map((s) => s.trim()).filter(Boolean),
      companions: companions.length > 0 ? companions : undefined,
      note,
      photos,
      music: {
        title: '',
        artist: '',
        url: musicUrl,
      },
    };

    onSave(travel);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative max-h-[92vh] w-[min(94vw,34rem)] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-slate-100 px-2.5 py-0.5 text-sm text-slate-500 hover:bg-slate-200"
          >
            ✕
          </button>

          <h2 className="text-xl font-bold text-slate-700">{isEditing ? '编辑旅行' : '新建旅行'}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {isEditing ? '修改后会保存到云端，其他浏览器也能看到' : '填好后保存，地球上马上出现新打卡点'}
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="旅程标题 *" value={title} onChange={setTitle} placeholder="示例城市之旅" />
              <Field label="类型" value={category} onChange={(v) => setCategory(v as TravelCategory)} type="select" options={categoryOptions} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field label="目的地城市 *" value={city} onChange={setCity} placeholder="示例市" />
              <Field label="国家 *" value={country} onChange={setCountry} placeholder="示例国" />
              <Field label="出发城市" value={originCity} onChange={setOriginCity} placeholder="上海" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="开始日期" value={startDate} onChange={setStartDate} type="date" />
              <Field label="结束日期" value={endDate} onChange={setEndDate} type="date" />
            </div>
            {startDate && endDate && (
              <p className="text-xs text-emerald-500">自动计算：{calcDays(startDate, endDate)} 天</p>
            )}
            {originCity && city && liveDistance > 0 && (
              <p className="text-xs text-emerald-500">
                📏 估算距离：{liveDistance} 公里（{originCity} → {city}）
              </p>
            )}
            {resolvingCity && (
              <p className="text-xs text-sky-500">🔍 正在查找「{resolvingCity}」的坐标...</p>
            )}
            {originCity && city && !resolvingCity && liveDistance === 0 && (
              <p className="text-xs text-amber-500">
                ⚠️ 没找到「{originCity}」或「{city}」的坐标，请手动填写下面距离
              </p>
            )}
            <div>
              <label className="mb-1 block text-xs text-slate-500">距离（公里）</label>
              <input
                type="number"
                min="0"
                value={distanceStr}
                onChange={(e) => setDistanceStr(e.target.value)}
                placeholder={liveDistance > 0 ? String(liveDistance) : '比如 1500'}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-300"
              />
              {liveDistance > 0 && distanceStr === '' && (
                <p className="mt-1 text-xs text-slate-300">
                  留空则使用估算值 {liveDistance} 公里
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="旅行搭子" value={companionsStr} onChange={setCompanionsStr} placeholder="旅伴 A，旅伴 B" />
              <Field label="氛围标签" value={moodTagsStr} onChange={setMoodTagsStr} placeholder="☕ 治愈，🎒 暴走" />
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-500">旅行小记</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="写下最想记住的画面..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-300"
                rows={3}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-500">音乐</label>
              <input
                ref={musicInputRef}
                type="file"
                accept="audio/*,.mp3,.m4a,.mp4,.wav,.ogg"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleMusicFile(file);
                  e.target.value = '';
                }}
              />
              {/* 上传区：独立的 drop 区域，不会和下面的"外链"输入框混淆 */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!isDraggingMusic) setIsDraggingMusic(true);
                }}
                onDragLeave={(e) => {
                  // 只有离开这个 div 自身时才清状态，子元素触发会冒泡
                  if (e.currentTarget === e.target) setIsDraggingMusic(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingMusic(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) void handleMusicFile(file);
                }}
                className={`relative rounded-lg border-2 border-dashed px-3 py-4 text-sm transition ${
                  isDraggingMusic
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                    : 'border-slate-300 bg-slate-50 text-slate-500'
                }`}
                onClick={() => musicInputRef.current?.click()}
                role="button"
                tabIndex={0}
              >
                {isMusicReading ? (
                  <p className="text-center">正在读取音频...</p>
                ) : musicFileName ? (
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate">已上传：{musicFileName}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDelete({ type: 'music', fileName: musicFileName });
                      }}
                      className="flex-shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-300"
                    >
                      移除
                    </button>
                  </div>
                ) : (
                  <p className="text-center">
                    🎵 点击或拖拽音乐文件到这里
                    <span className="mt-1 block text-xs text-slate-400">
                      支持 mp3 / m4a / mp4 / wav / ogg
                    </span>
                  </p>
                )}
              </div>

              {/* 外链区：和上传区独立，不影响 drop 行为 */}
              <div className="mt-2">
                <input
                  type="text"
                  value={musicFileName ? '' : musicUrl}
                  onChange={(e) => { setMusicUrl(e.target.value); setMusicFileName(null); }}
                  placeholder="或者直接粘贴 mp3 / 网易云 外链（mp3 外链更稳）"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-300"
                />
                <p className="mt-1 text-xs text-slate-300">
                  网易云/QQ 音乐普通分享链接多数不能直接播放，建议用 mp3 外链或上传文件。
                </p>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-500">照片</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotos}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith('image/'));
                  if (files.length > 0) void addPhotoFiles(files);
                }}
                disabled={isCompressing}
                className="rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm text-slate-500 hover:border-emerald-300 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCompressing ? '正在压缩照片...' : '+ 选择照片'}
              </button>
              <p className="mt-1 text-xs text-slate-300">照片会自动压缩后保存。一次建议 6 张以内，重要旅行最终建议写进源码或接数据库。</p>
              {photos.length > 0 && (
                <div className="mt-3 space-y-3">
                  {photos.map((p, i) => (
                    <div key={`photo-meta-${p.src}-${i}`} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                      <div className="flex gap-3">
                        <img src={p.src} alt="" className="h-20 w-20 flex-shrink-0 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        <div className="min-w-0 flex-1 space-y-2">
                          <input
                            type="text"
                            value={p.caption ?? ''}
                            onChange={(e) =>
                              setPhotos((prev) =>
                                prev.map((photo, idx) =>
                                  idx === i ? { ...photo, caption: e.target.value } : photo,
                                ),
                              )
                            }
                            placeholder="照片名字 / 地点"
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-emerald-300"
                          />
                          <textarea
                            value={p.comment ?? ''}
                            onChange={(e) =>
                              setPhotos((prev) =>
                                prev.map((photo, idx) =>
                                  idx === i ? { ...photo, comment: e.target.value } : photo,
                                ),
                              )
                            }
                            placeholder="写给这张照片的一句话..."
                            rows={2}
                            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-emerald-300"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setPendingDelete({
                                type: 'photo',
                                index: i,
                                caption: p.caption,
                              })
                            }
                            className="text-xs text-slate-400 hover:text-red-400"
                          >
                            删除这张照片
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {photos.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {photos.map((p, i) => (
                    <div key={`${p.src}-${i}`} className="relative h-16 w-16 overflow-hidden rounded-lg border border-slate-100">
                      <img src={p.src} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          setPendingDelete({
                            type: 'photo',
                            index: i,
                            caption: p.caption,
                          })
                        }
                        className="absolute right-0 top-0 rounded-bl-lg bg-black/50 px-1.5 text-xs text-white"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-500 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? '正在保存...' : '保存旅行'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>

      <ConfirmDialog
        open={pendingDelete?.type === 'photo'}
        title="确定要删除这张照片吗？"
        message={
          pendingDelete?.type === 'photo' && pendingDelete.caption
            ? `「${pendingDelete.caption}」\n\n仅在本表单中删除，保存后才会从云端删除。`
            : '仅在本表单中删除，保存后才会从云端删除。'
        }
        confirmText="删除"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete?.type === 'photo') {
            const idx = pendingDelete.index;
            setPhotos((prev) => prev.filter((_, i) => i !== idx));
          }
          setPendingDelete(null);
        }}
      />

      <ConfirmDialog
        open={pendingDelete?.type === 'music'}
        title="确定要移除这段音乐吗？"
        message={
          pendingDelete?.type === 'music'
            ? `「${pendingDelete.fileName}」\n\n仅在本表单中移除，保存后才会从云端删除。`
            : undefined
        }
        confirmText="移除"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete?.type === 'music') {
            setMusicFileName(null);
            setMusicUrl('');
          }
          setPendingDelete(null);
        }}
      />
    </AnimatePresence>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: 'text' | 'date' | 'select';
  options?: { value: string; label: string }[];
}) {
  const cls = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-300';

  if (type === 'select' && options) {
    return (
      <div>
        <label className="mb-1 block text-xs text-slate-500">{label}</label>
        <select value={value} onChange={(e) => onChange(e.target.value)} className={cls}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div>
      <label className="mb-1 block text-xs text-slate-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cls}
      />
    </div>
  );
}
