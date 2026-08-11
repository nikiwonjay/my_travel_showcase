import { motion } from 'framer-motion';
import type { PassportStats as Stats } from '../types/travel';
import { formatEarthLaps } from '../utils/stats';

interface PassportStatsProps {
  stats: Stats;
  collapsed: boolean;
  onToggle: () => void;
}

export default function PassportStats({ stats, collapsed, onToggle }: PassportStatsProps) {
  return (
    <motion.aside
      className="glass-panel absolute left-4 top-4 z-20 w-72 overflow-hidden"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-slate-700">旅行护照</span>
        <span className="text-xs text-slate-500">{collapsed ? '展开' : '收起'}</span>
      </button>

      {!collapsed && (
        <div className="space-y-3 border-t border-sky-100 px-5 pb-5 pt-4 text-sm text-slate-600">
          <StatRow label="点亮旅程" value={`${stats.totalTrips} 次`} />
          <StatRow label="探索城市" value={`${stats.totalCities} 座`} />
          <StatRow label="累计里程" value={`${stats.totalDistanceKm.toLocaleString()} km`} />
          <StatRow
            label="绕地球"
            value={`${formatEarthLaps(stats.totalDistanceKm)} 圈`}
          />
          <StatRow label="在路上" value={`${stats.totalDays} 天`} />
        </div>
      )}
    </motion.aside>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-700">{value}</span>
    </div>
  );
}
