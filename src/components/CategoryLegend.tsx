import { categoryColors, categoryLabels } from '../constants/categories';
import type { TravelCategory } from '../types/travel';

const categories = Object.keys(categoryLabels) as TravelCategory[];

export default function CategoryLegend() {
  return (
    <aside className="glass-panel absolute right-4 top-4 z-20 hidden w-44 p-4 md:block">
      <p className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-500">旅行类型</p>
      <ul className="space-y-2">
        {categories.map((category) => (
          <li key={category} className="flex items-center gap-2 text-sm text-slate-600">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full shadow-[0_0_8px_currentColor]"
              style={{ color: categoryColors[category], backgroundColor: categoryColors[category] }}
            />
            {categoryLabels[category]}
          </li>
        ))}
      </ul>
    </aside>
  );
}
