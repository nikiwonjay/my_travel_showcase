import type { Travel, TravelCategory, TravelPhoto } from '../types/travel';
import { SUPABASE_URL, TRAVEL_PHOTOS_BUCKET, supabaseHeaders } from '../lib/supabase';
import { personalTravels } from './travels.personal';
import { withResolvedMedia } from '../utils/media';

type TravelRow = {
  id: string;
  title: string;
  city: string;
  country: string;
  start_date: string;
  end_date: string;
  days: number;
  category: TravelCategory;
  color: string | null;
  origin_lat: number;
  origin_lng: number;
  origin_label: string;
  destination_lat: number;
  destination_lng: number;
  destination_label: string;
  distance_km: number;
  mood_tags: string[] | null;
  companions: string[] | null;
  note: string | null;
  music_url: string | null;
  travel_photos?: PhotoRow[];
};

type PhotoRow = {
  id: string;
  travel_id: string;
  src: string;
  caption: string | null;
  date: string | null;
  comment: string | null;
  sort_order: number;
};

const CLOUD_CACHE_KEY = 'travel-cloud-cache-v1';

function loadCloudCache(): Travel[] {
  try {
    const raw = localStorage.getItem(CLOUD_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Travel[]).map(withResolvedMedia) : [];
  } catch {
    return [];
  }
}

function saveCloudCache(travels: Travel[]) {
  try {
    localStorage.setItem(CLOUD_CACHE_KEY, JSON.stringify(travels));
  } catch {
    // 缓存只是云端超时兜底，写入失败不能影响正常使用。
  }
}

function cacheSavedTravel(travel: Travel) {
  const cached = loadCloudCache();
  const index = cached.findIndex((item) => item.id === travel.id);
  if (index >= 0) cached[index] = travel;
  else cached.push(travel);
  saveCloudCache(cached);
}

function removeCachedTravel(travelId: string) {
  saveCloudCache(loadCloudCache().filter((travel) => travel.id !== travelId));
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function dataUrlToBlob(dataUrl: string) {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: supabaseHeaders(init?.headers),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase request failed: ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

/** 只重试只读请求；写请求不能盲目重试，否则超时后可能产生重复数据。 */
async function readWithRetry<T>(path: string, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await request<T>(path);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await wait(250 * attempt);
    }
  }
  throw lastError;
}

function rowToTravel(row: TravelRow): Travel {
  const photos = [...(row.travel_photos ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((photo) => ({
      src: photo.src,
      caption: photo.caption ?? undefined,
      date: photo.date ?? undefined,
      comment: photo.comment ?? undefined,
    }));

  return withResolvedMedia({
    id: row.id,
    title: row.title,
    city: row.city,
    country: row.country,
    startDate: row.start_date,
    endDate: row.end_date,
    days: row.days,
    category: row.category,
    color: row.color ?? undefined,
    origin: {
      lat: row.origin_lat,
      lng: row.origin_lng,
      label: row.origin_label,
    },
    destination: {
      lat: row.destination_lat,
      lng: row.destination_lng,
      label: row.destination_label,
    },
    distanceKm: row.distance_km,
    moodTags: row.mood_tags ?? [],
    companions: row.companions ?? undefined,
    note: row.note ?? '',
    photos,
    music: {
      title: '',
      artist: '',
      url: row.music_url ?? '',
    },
  });
}

function travelToRow(travel: Travel) {
  return {
    id: travel.id,
    title: travel.title,
    city: travel.city,
    country: travel.country,
    start_date: travel.startDate,
    end_date: travel.endDate,
    days: travel.days,
    category: travel.category,
    color: travel.color ?? null,
    origin_lat: travel.origin.lat,
    origin_lng: travel.origin.lng,
    origin_label: travel.origin.label,
    destination_lat: travel.destination.lat,
    destination_lng: travel.destination.lng,
    destination_label: travel.destination.label,
    distance_km: travel.distanceKm,
    mood_tags: travel.moodTags,
    companions: travel.companions ?? null,
    note: travel.note,
    music_url: travel.music.url || null,
  };
}

async function uploadPhoto(travelId: string, photo: TravelPhoto, index: number) {
  if (!photo.src.startsWith('data:image')) return photo.src;

  const blob = dataUrlToBlob(photo.src);
  const safeTravelId = travelId.replace(/[^a-zA-Z0-9_-]/g, '-') || 'trip';
  const path = `${safeTravelId}/${Date.now()}-${index}.jpg`;
  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${TRAVEL_PHOTOS_BUCKET}/${path}`,
    {
      method: 'POST',
      headers: supabaseHeaders({
        'Content-Type': 'image/jpeg',
        'x-upsert': 'true',
      }),
      body: blob,
    },
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${TRAVEL_PHOTOS_BUCKET}/${path}`;
}

async function uploadMusic(travelId: string, musicUrl: string) {
  // 修复：之前判断 'data:audio' 太严，用户传的 .mp4 音频是 'data:video/mp4;base64,...'
  // 被跳过上传，主表直接存了 23MB base64，触发 8s 超时
  // 现在接受所有 data: URI（任何 base64 都走 Storage），https:// 或空字符串原样返回
  if (!musicUrl.startsWith('data:')) return musicUrl;

  const blob = dataUrlToBlob(musicUrl);
  const safeTravelId = travelId.replace(/[^a-zA-Z0-9_-]/g, '-') || 'trip';
  const path = `${safeTravelId}/music-${Date.now()}.mp3`;
  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${TRAVEL_PHOTOS_BUCKET}/${path}`,
    {
      method: 'POST',
      headers: supabaseHeaders({
        'Content-Type': blob.type || 'audio/mpeg',
        'x-upsert': 'true',
      }),
      body: blob,
    },
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${TRAVEL_PHOTOS_BUCKET}/${path}`;
}

function mergeWithLocalFallback(cloudTravel: Travel, localTravel?: Travel): Travel {
  if (!localTravel) return cloudTravel;

  return {
    ...localTravel,
    ...cloudTravel,
    photos: cloudTravel.photos.length > 0 ? cloudTravel.photos : localTravel.photos,
    music: cloudTravel.music.url ? cloudTravel.music : localTravel.music,
  };
}

export async function fetchTravelsFromCloud() {
  const cachedTravels = loadCloudCache();
  const cachedById = new Map(cachedTravels.map((travel) => [travel.id, travel]));

  // 1) 先只拉 travels 主表。主表暂时失败时直接显示上次成功缓存，
  //    不用空数组覆盖页面上的照片。
  let cloudRows: TravelRow[];
  try {
    cloudRows = await readWithRetry<TravelRow[]>('/rest/v1/travels?order=start_date.asc');
  } catch (error) {
    if (cachedTravels.length > 0) {
      console.warn('[fetchTravelsFromCloud] 主表读取失败，使用上次成功缓存：', error);
      return cachedTravels;
    }
    throw error;
  }

  // 2) 再单独拉所有 travel_photos（按 travel_id 过滤，URL 用 in.()）
  //    这样两个 query 都比较小，不会因为 deep select 一次性拉很多行撞超时
  //
  // ⚠️ 关键：order 语法必须是 col.asc 或 col.desc，每段独立带方向
  //    之前写的 "order=travel_id,sort_order.asc" 会被 PostgREST 解析为：
  //    - 第一个排序键 = travel_id（默认 asc）
  //    - 第二个排序键 = 字面列名 "sort_order.asc"（找不到这列）→ 400 错误
  //    → photoRows = [] → 所有照片都拉不到 → "所有照片都没了"
  //    正确写法是 "order=travel_id.asc,sort_order.asc"（每段都带 .asc）
  //
  // ⚠️ 按 src 去重：保存流程是"先插后删"，如果 DELETE 撞超时，
  //    云端 travel_photos 可能短暂存在 (travel_id, src) 重复行。
  //    fetch 时按 src 保留第一条（sort_order 最小的），避免用户看到重复。
  // 每段旅行单独查询，避免照片变多后一个大查询触发 statement_timeout。
  // 某一段连续失败时，只对该段使用上次成功缓存。
  const photosByTravelId = new Map<string, PhotoRow[]>();
  const photoReadFailed = new Set<string>();
  for (const row of cloudRows) {
    try {
      const rows = await readWithRetry<PhotoRow[]>(
        `/rest/v1/travel_photos?travel_id=eq.${encodeURIComponent(row.id)}&order=sort_order.asc`,
      );
      const deduped = rows.filter(
        (photo, index, all) => all.findIndex((candidate) => candidate.src === photo.src) === index,
      );
      photosByTravelId.set(row.id, deduped);
    } catch (error) {
      photoReadFailed.add(row.id);
      console.warn(`[fetchTravelsFromCloud] ${row.id} 照片读取失败，使用缓存：`, error);
    }
  }

  const localById = new Map(personalTravels.map((travel) => [travel.id, withResolvedMedia(travel)]));
  const cloudTravels = cloudRows.map((row) => {
    let cloudTravel = rowToTravel({
      ...row,
      travel_photos: photosByTravelId.get(row.id) ?? [],
    });
    if (photoReadFailed.has(row.id) && cachedById.has(row.id)) {
      cloudTravel = {
        ...cloudTravel,
        photos: cachedById.get(row.id)!.photos,
      };
    }
    return mergeWithLocalFallback(cloudTravel, localById.get(cloudTravel.id));
  });
  const cloudIds = new Set(cloudTravels.map((travel) => travel.id));
  const localTravels = personalTravels
    .filter((travel) => !cloudIds.has(travel.id))
    .map(withResolvedMedia);

  const result = [...localTravels, ...cloudTravels];
  saveCloudCache(result);
  return result;
}

export async function saveTravelToCloud(travel: Travel, baseline?: Travel) {
  // 先把音频上传到 Storage，得到可访问的 URL
  const musicUrl = await uploadMusic(travel.id, travel.music.url);
  const travelForSave: Travel = {
    ...travel,
    music: {
      ...travel.music,
      url: musicUrl,
    },
  };

  // 原子 upsert：绝不再采用“先 DELETE、后 INSERT”。即使请求超时，
  // 数据库里也只会是旧记录或新记录，不会出现旅行被删到一半的空窗。
  // 音乐已先上传到 Storage，这里不会再把数 MB 的 data URI 写进主表。
  await request('/rest/v1/travels', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(travelToRow(travelForSave)),
  });

  // 照片做 diff：
  // 1) src 是 data:image 的 → 需要新上传
  // 2) baseline 中存在、但新 photos 里没有的（按 src 比对） → 需要删除
  // 3) 都没变化 → 完全跳过 travel_photos 表（避免 8s 超时）
  //
  // ⚠️ 关键：newSrcs 只能包含 https:// 形式的 src（云端已上传的）
  //    如果把 data:image 形式也加进去，baseline 里的 https://... 老照片
  //    永远不会出现在 newSrcs 里，会被全部误判为"被删除" → 真删了
  const newSrcs = new Set(
    travel.photos
      .filter((photo) => !photo.src.startsWith('data:image'))
      .map((photo) => photo.src),
  );
  const dataPhotoIndexes: number[] = [];
  travel.photos.forEach((photo, index) => {
    if (photo.src.startsWith('data:image')) dataPhotoIndexes.push(index);
  });
  const removedPhotos = (baseline?.photos ?? []).filter((photo) => !newSrcs.has(photo.src));

  if (dataPhotoIndexes.length === 0 && removedPhotos.length === 0) {
    const saved = {
      ...travel,
      music: { ...travel.music, url: musicUrl },
    };
    cacheSavedTravel(saved);
    return saved;
  }

  // 1) 串行上传新照片
  const newPhotoRows: Array<{
    travel_id: string;
    src: string;
    caption: string | null;
    date: string | null;
    comment: string | null;
    sort_order: number;
  }> = [];
  for (const index of dataPhotoIndexes) {
    const photo = travel.photos[index];
    const src = await uploadPhoto(travel.id, photo, index);
    newPhotoRows.push({
      travel_id: travel.id,
      src,
      caption: photo.caption ?? null,
      date: photo.date ?? null,
      comment: photo.comment ?? null,
      sort_order: index,
    });
  }

  // 2) 先 INSERT 新照片
  //    ⚠️ 关键：先插后删。如果这步撞超时，老照片还在云端，绝对不会丢。
  //    之前是先 DELETE 后 INSERT（"半截保存"），可能导致某些旅行变成 0 张照片
  if (newPhotoRows.length > 0) {
    const BATCH = 5;
    for (let i = 0; i < newPhotoRows.length; i += BATCH) {
      const batch = newPhotoRows.slice(i, i + BATCH);
      await request('/rest/v1/travel_photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(batch),
      });
    }
  }

  // 3) 全部新照片写入成功后，才逐张删除用户明确移除的关联。
  //    每个请求最多影响一张；某次超时就保留该张旧照片，不会批量清空。
  for (const photo of removedPhotos) {
    try {
      await request(
        `/rest/v1/travel_photos?travel_id=eq.${encodeURIComponent(travel.id)}&src=eq.${encodeURIComponent(photo.src)}`,
        {
          method: 'DELETE',
          headers: { Prefer: 'return=minimal' },
        },
      );
    } catch (error) {
      console.warn(
        '[saveTravelToCloud] 单张旧照片删除失败，已安全保留：',
        error,
      );
    }
  }

  // 保留下来没动的 URL 照片
  const keptPhotos = travel.photos
    .filter((photo) => !photo.src.startsWith('data:image'))
    .map((photo) => ({
      src: photo.src,
      caption: photo.caption,
      date: photo.date,
      comment: photo.comment,
    }));

  const saved = {
    ...travel,
    photos: [...keptPhotos, ...newPhotoRows.map((p) => ({
      src: p.src,
      caption: p.caption ?? undefined,
      date: p.date ?? undefined,
      comment: p.comment ?? undefined,
    }))],
    music: { ...travel.music, url: musicUrl },
  };
  cacheSavedTravel(saved);
  return saved;
}

// 删除整条旅行（云端 + 关联照片）
// 删除 travels 行 + travel_photos 行
// 注意：Storage 桶里的图片对象**不会**自动删除（孤儿文件）
// 因为删除是按文件路径精确删除的，不在主表 + 关联表批量清理
// 想要清理可以跑 SQL：SELECT * FROM storage.objects WHERE bucket_id = 'travel-photos' AND name LIKE '<travel_id>/%'
export async function deleteTravelFromCloud(travelId: string) {
  // 1) 先删关联照片（travel_photos）
  await request(
    `/rest/v1/travel_photos?travel_id=eq.${encodeURIComponent(travelId)}`,
    {
      method: 'DELETE',
      headers: { Prefer: 'return=minimal' },
    },
  );
  // 2) 再删主表行
  await request(
    `/rest/v1/travels?id=eq.${encodeURIComponent(travelId)}`,
    {
      method: 'DELETE',
      headers: { Prefer: 'return=minimal' },
    },
  );
  removeCachedTravel(travelId);
}
