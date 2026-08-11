import { useEffect, useState } from 'react';
import AddTravelForm from './components/AddTravelForm';
import TimelineView from './components/TimelineView';
import TravelGlobe from './components/TravelGlobe';
import TravelModal from './components/TravelModal';
import ViewToolbar from './components/ViewToolbar';
import { deleteTravelFromCloud, fetchTravelsFromCloud, saveTravelToCloud } from './data/cloudTravels';
import { getAllTravels, isUsingDemoTravels } from './data/travels';
import { isSupabaseConfigured } from './lib/supabase';
import type { Travel, ViewMode } from './types/travel';
import { pickRandomTravel } from './utils/stats';

export default function App() {
  const [travels, setTravels] = useState<Travel[]>(getAllTravels);
  const [selectedTravel, setSelectedTravel] = useState<Travel | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('globe');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editTravel, setEditTravel] = useState<Travel | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    fetchTravelsFromCloud()
      .then((cloudTravels) => {
        setTravels(cloudTravels);
        setLoadError(null);
      })
      .catch(() => {
        setLoadError('云端数据暂时没有加载成功，请确认 Supabase 表和 Storage 已经创建。');
      });
  }, []);

  const handleSelect = (travel: Travel) => {
    setSelectedTravel(travel);
  };

  const handleRandomMemory = () => {
    const randomTravel = pickRandomTravel(travels);
    setSelectedTravel(randomTravel);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const handleSaveTravel = async (travel: Travel) => {
    setIsSaving(true);
    try {
      const saved = isSupabaseConfigured
        ? await saveTravelToCloud(travel, editTravel ?? undefined)
        : travel;
      // 不再 refreshTravels（deep select 在数据多时也会撞 8s 超时）
      // 直接把保存结果合进本地 state，用户能立即看到新旅程
      setTravels((prev) => {
        const exists = prev.some((t) => t.id === saved.id);
        if (exists) {
          return prev.map((t) => (t.id === saved.id ? saved : t));
        }
        return [...prev, saved];
      });
      setShowAddForm(false);
      setEditTravel(null);
      setSelectedTravel(saved);
      setLoadError(null);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : String(error);
      alert(
        '云端保存失败，先别急。\n\n' +
          '最常见的原因：\n' +
          '1. 一次性上传太多 / 太大文件，可以先少传几张试一下\n' +
          '2. Supabase 8 秒 statement_timeout 触发了\n' +
          '3. 网络不稳定或 .env 配错\n\n' +
          '浏览器控制台里有更详细的报错：\n' +
          message,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (travel: Travel) => {
    setEditTravel(travel);
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditTravel(null);
  };

  const handleDeleteTravel = async (travel: Travel) => {
    try {
      if (isSupabaseConfigured) await deleteTravelFromCloud(travel.id);
      // 1) 立刻从本地 state 移除（用户能立即看到效果）
      setTravels((prev) => prev.filter((t) => t.id !== travel.id));
      // 2) 关闭 modal
      setSelectedTravel(null);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : String(error);
      alert('删除失败：' + message);
    }
  };

  return (
    <div className="travel-app-shell relative h-full w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-6%] h-72 w-72 rounded-full bg-[#d8f5ea] blur-3xl" />
        <div className="absolute right-[-8%] top-[10%] h-80 w-80 rounded-full bg-[#d9efff] blur-3xl" />
        <div className="absolute bottom-[-10%] left-[12%] h-72 w-72 rounded-full bg-[#fff0f6] blur-3xl" />
        <div className="flower flower-a" />
        <div className="flower flower-b" />
        <div className="flower flower-c" />
        <div className="flower flower-d" />
      </div>

      <header className="pointer-events-none absolute left-1/2 top-6 z-20 w-[min(92vw,42rem)] -translate-x-1/2 text-center">
        <h1 className="mt-2 text-3xl font-bold text-slate-700 md:text-4xl">我的旅行日记</h1>
        <p className="mt-2 text-sm text-slate-400/90">每一次出发，都是和世界重新打一声招呼</p>
        {isUsingDemoTravels && (
          <p className="mt-1 text-xs text-slate-400">
            当前为公开展示版，页面中的旅行均为虚构示例数据。
          </p>
        )}
        {loadError && <p className="mt-1 text-xs text-amber-500">{loadError}</p>}
      </header>

      <button
        type="button"
        onClick={() => setShowAddForm(true)}
        className="absolute right-5 top-7 z-30 rounded-full border border-emerald-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-emerald-600 shadow-sm backdrop-blur transition hover:bg-emerald-50"
      >
        + 新建旅行
      </button>

      {viewMode === 'globe' ? (
        <div className="absolute inset-0">
          <TravelGlobe
            travels={travels}
            selectedId={selectedTravel?.id ?? null}
            onSelect={handleSelect}
          />
        </div>
      ) : (
        <TimelineView
          travels={travels}
          selectedId={selectedTravel?.id ?? null}
          onSelect={handleSelect}
        />
      )}

      <ViewToolbar
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onRandomMemory={handleRandomMemory}
      />

      <TravelModal
        travel={selectedTravel}
        onClose={() => setSelectedTravel(null)}
        onEdit={handleEdit}
        onDelete={handleDeleteTravel}
      />

      {showAddForm && (
        <AddTravelForm
          onSave={handleSaveTravel}
          onClose={handleCloseForm}
          editTravel={editTravel}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
