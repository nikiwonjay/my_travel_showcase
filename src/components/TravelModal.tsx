import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Travel, TravelPhoto } from '../types/travel';
import { categoryLabels } from '../constants/categories';
import { useTravelAudio } from '../hooks/useTravelAudio';
import { formatDateRange } from '../utils/stats';
import { getMusicEmbedHtml } from '../utils/media';
import ConfirmDialog from './ConfirmDialog';

interface TravelModalProps {
  travel: Travel | null;
  onClose: () => void;
  onEdit?: (travel: Travel) => void;
  onDelete?: (travel: Travel) => void;
}

function PhotoLightbox({
  photo,
  onClose,
}: {
  photo: TravelPhoto;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative flex max-h-[92vh] w-[min(92vw,40rem)] flex-col items-center rounded-2xl bg-white p-4 shadow-2xl"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full bg-slate-100 px-2.5 py-0.5 text-sm text-slate-500 hover:bg-slate-200"
        >
          ✕
        </button>

        <img
          src={photo.src}
          alt={photo.caption ?? ''}
          className="max-h-[60vh] w-full rounded-lg object-contain"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />

        <div className="mt-3 w-full text-center">
          {photo.caption && (
            <p className="text-sm text-slate-500">
              {photo.caption}
              {photo.date && ` · ${photo.date}`}
            </p>
          )}
        </div>

        {photo.comment && (
          <div className="mt-4 w-full border-t border-slate-100 pt-3">
            <p className="px-3 py-2 text-center text-sm leading-6 text-slate-600">
              "{photo.comment}"
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function TravelModal({ travel, onClose, onEdit, onDelete }: TravelModalProps) {
  const { canPlayDirectAudio, isPlaying, toggle } = useTravelAudio(travel);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!travel) {
      setLightboxIndex(null);
      setShowDeleteConfirm(false);
    }
  }, [travel]);

  return (
    <AnimatePresence>
      {travel && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-[#f7fcff]/70 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.article
            className="glass-panel relative max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-white/70 bg-white/86 p-6 shadow-[0_30px_80px_rgba(148,184,212,0.25)]"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="absolute right-4 top-4 flex gap-2">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(travel)}
                  className="rounded-full border border-emerald-100 bg-white/70 px-3 py-1 text-sm text-slate-500 transition hover:bg-white hover:text-emerald-600"
                >
                  编辑
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded-full border border-red-100 bg-white/70 px-3 py-1 text-sm text-slate-500 transition hover:bg-red-50 hover:text-red-500"
                >
                  删除
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-emerald-100 bg-white/70 px-3 py-1 text-sm text-slate-500 transition hover:bg-white"
              >
                关闭
              </button>
            </div>

            <header className="pr-16">
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-500/80">
                {categoryLabels[travel.category]}
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-700">{travel.title}</h2>
              <p className="mt-1 text-slate-500">
                {travel.city}, {travel.country}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                {formatDateRange(travel.startDate, travel.endDate)} · {travel.days} 天 ·{' '}
                {travel.origin.label} → {travel.destination.label} · {travel.distanceKm.toLocaleString()} km
              </p>
              {travel.music.url && (() => {
                const embed = getMusicEmbedHtml(travel.music.url);
                if (!embed || embed.type !== 'iframe') return null;
                return (
                  <iframe
                    src={embed.src}
                    className="mt-3 h-[66px] w-full max-w-[260px] rounded-lg border-0"
                    allow="autoplay"
                    title="音乐播放器"
                  />
                );
              })()}
            </header>

            {canPlayDirectAudio && (
              <button
                type="button"
                onClick={toggle}
                className="mt-4 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 text-sm text-emerald-700 transition hover:bg-emerald-100"
              >
                {isPlaying ? '暂停音乐' : '播放音乐'}
              </button>
            )}

            {travel.companions && travel.companions.length > 0 && (
              <p className="mt-3 text-sm text-slate-500">
                <span className="text-slate-400">旅行搭子：</span>
                {travel.companions.join('、')}
              </p>
            )}

            <section className="mt-6 flex flex-wrap gap-2">
              {travel.moodTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-sm text-emerald-700"
                >
                  {tag}
                </span>
              ))}
            </section>

            <p className="mt-6 leading-8 text-slate-600">{travel.note}</p>

            <section className="mt-8">
              <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                拍立得回忆
              </h3>
              <div className="flex flex-wrap gap-3">
                {travel.photos.map((photo, index) => (
                  <motion.div
                    key={`${photo.src}-${index}`}
                    className="polaroid cursor-pointer"
                    style={{ rotate: `${index % 2 === 0 ? -2 : 2.5}deg` }}
                    whileHover={{ scale: 1.06, rotate: 0 }}
                    onClick={() => setLightboxIndex(index)}
                  >
                    <img
                      src={photo.src}
                      alt={photo.caption ?? `${travel.city} 回忆 ${index + 1}`}
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <p className="polaroid-caption">
                      {photo.caption ?? travel.city}
                      {photo.date ? ` · ${photo.date}` : ` · ${travel.startDate.slice(0, 7)}`}
                    </p>
                  </motion.div>
                ))}
              </div>
            </section>
          </motion.article>
        </motion.div>
      )}

      {travel && lightboxIndex !== null && travel.photos[lightboxIndex] && (
        <PhotoLightbox
          key={`${travel.id}-${lightboxIndex}`}
          photo={travel.photos[lightboxIndex]}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        title={`确定要删除「${travel?.title}」吗？`}
        message="删除后这条旅行将不再显示。"
        confirmText="确认删除"
        cancelText="取消删除"
        danger
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={async () => {
          if (!travel || !onDelete || isDeleting) return;
          setIsDeleting(true);
          try {
            await onDelete(travel);
            setShowDeleteConfirm(false);
          } finally {
            setIsDeleting(false);
          }
        }}
      />
    </AnimatePresence>
  );
}
