import { motion } from 'framer-motion';
import type { Travel } from '../types/travel';
import { categoryLabels } from '../constants/categories';
import { getTravelColor } from '../constants/categories';
import { formatDateRange } from '../utils/stats';

interface TimelineViewProps {
  travels: Travel[];
  selectedId: string | null;
  onSelect: (travel: Travel) => void;
}

export default function TimelineView({ travels, selectedId, onSelect }: TimelineViewProps) {
  const sorted = [...travels].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );

  return (
    <div className="film-scroll h-full w-full overflow-x-auto overflow-y-hidden px-6 pb-28 pt-28">
      <div className="film-strip mx-auto flex min-w-max items-stretch gap-0 py-8">
        {sorted.map((travel, index) => {
          const color = getTravelColor(travel.category, travel.color);
          const isSelected = selectedId === travel.id;
          const cover = travel.photos[0]?.src;

          return (
            <div key={travel.id} className="flex items-stretch">
              {index > 0 && <div className="film-connector" aria-hidden />}

              <motion.button
                type="button"
                onClick={() => onSelect(travel)}
                className={`film-frame group relative w-72 shrink-0 text-left transition ${
                  isSelected ? 'ring-2 ring-emerald-300 ring-offset-4 ring-offset-[#f9fffd]' : ''
                }`}
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="film-perforations top" aria-hidden />
                <div className="overflow-hidden rounded-[24px] border border-white/70 bg-white/85 shadow-[0_18px_50px_rgba(148,184,212,0.18)]">
                  <div
                    className="relative h-40 bg-cover bg-center"
                    style={{
                      backgroundImage: cover ? `url(${cover})` : undefined,
                      backgroundColor: `${color}33`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/10 to-transparent" />
                    <span
                      className="absolute left-3 top-3 rounded-full px-2 py-0.5 text-xs font-medium text-white shadow-sm"
                      style={{ backgroundColor: `${color}cc` }}
                    >
                      {categoryLabels[travel.category]}
                    </span>
                  </div>

                  <div className="space-y-2 p-4">
                    <p className="text-xs text-slate-400">
                      {formatDateRange(travel.startDate, travel.endDate)}
                    </p>
                    <h3 className="text-xl font-bold text-slate-700">{travel.title}</h3>
                    <p className="text-sm text-slate-500">
                      {travel.city}, {travel.country}
                    </p>
                    <p className="line-clamp-2 text-sm leading-6 text-slate-500">{travel.note}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {travel.moodTags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="film-perforations bottom" aria-hidden />
              </motion.button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
