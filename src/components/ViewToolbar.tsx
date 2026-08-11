import type { ViewMode } from '../types/travel';

interface ViewToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onRandomMemory: () => void;
}

export default function ViewToolbar({
  viewMode,
  onViewModeChange,
  onRandomMemory,
}: ViewToolbarProps) {
  return (
    <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-wrap items-center justify-center gap-3 px-4">
      <div className="glass-panel flex overflow-hidden p-1">
        <ToolbarButton
          active={viewMode === 'globe'}
          onClick={() => onViewModeChange('globe')}
          label="🌍 地球"
        />
        <ToolbarButton
          active={viewMode === 'timeline'}
          onClick={() => onViewModeChange('timeline')}
          label="🎞️ 时间轴"
        />
      </div>

      <button
        type="button"
        onClick={onRandomMemory}
        className="glass-panel px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-white/80"
      >
        🎲 随机掉落回忆
      </button>
    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm transition ${
        active
          ? 'bg-white/80 text-slate-800 shadow-[0_8px_20px_rgba(191,219,254,0.45)]'
          : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
      }`}
    >
      {label}
    </button>
  );
}
