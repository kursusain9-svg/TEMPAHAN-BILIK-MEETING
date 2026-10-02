import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
      {toasts.map(toast => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
          error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
          info: <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />,
        };

        const bgStyles = {
          success: 'bg-white border-emerald-200 shadow-emerald-500/10',
          error: 'bg-white border-rose-200 shadow-rose-500/10',
          warning: 'bg-white border-amber-200 shadow-amber-500/10',
          info: 'bg-white border-sky-200 shadow-sky-500/10',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between p-4 rounded-xl border shadow-lg transition-all duration-200 animate-in slide-in-from-bottom-2 ${bgStyles[toast.type]}`}
          >
            <div className="flex items-start gap-3">
              {icons[toast.type]}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 leading-tight">
                  {toast.title}
                </h4>
                {toast.message && (
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {toast.message}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 -mr-1 -mt-1 rounded-md transition-colors"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
