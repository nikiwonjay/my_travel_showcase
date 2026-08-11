import { AnimatePresence, motion } from 'framer-motion';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  // 输入确认：需要用户输入某个词才能确认（用于危险操作）
  confirmKeyword?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = '确定',
  cancelText = '取消',
  danger = false,
  confirmKeyword,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/70 bg-white/95 shadow-[0_30px_80px_rgba(148,184,212,0.35)] backdrop-blur-md"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-6">
              <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
              {message && (
                <p className="mt-2 text-sm leading-6 text-slate-500 whitespace-pre-line">
                  {message}
                </p>
              )}
              {confirmKeyword && (
                <div className="mt-4">
                  <p className="text-xs text-slate-400">
                    请输入 <span className="font-mono text-red-500">{confirmKeyword}</span> 以确认
                  </p>
                  <input
                    type="text"
                    autoFocus
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-red-300"
                    onChange={(e) => {
                      const input = e.target;
                      const btn = input.parentElement?.parentElement?.querySelector<HTMLButtonElement>('[data-confirm-btn]');
                      if (btn) btn.disabled = input.value !== confirmKeyword;
                    }}
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-50"
              >
                {cancelText}
              </button>
              <button
                type="button"
                data-confirm-btn
                onClick={onConfirm}
                disabled={!!confirmKeyword}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  danger
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
