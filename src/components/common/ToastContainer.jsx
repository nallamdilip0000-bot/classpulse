import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        let bgStyle = 'bg-slate-900 text-white border-slate-700';
        let IconComponent = Info;
        let iconColor = 'text-blue-400';

        if (toast.type === 'success') {
          bgStyle = 'bg-emerald-950 text-emerald-50 border-emerald-800';
          IconComponent = CheckCircle2;
          iconColor = 'text-emerald-400';
        } else if (toast.type === 'warning') {
          bgStyle = 'bg-amber-950 text-amber-50 border-amber-800';
          IconComponent = AlertTriangle;
          iconColor = 'text-amber-400';
        } else if (toast.type === 'error' || toast.type === 'urgent') {
          bgStyle = 'bg-rose-950 text-rose-50 border-rose-800';
          IconComponent = AlertCircle;
          iconColor = 'text-rose-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${bgStyle}`}
          >
            <IconComponent className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor}`} />
            <div className="flex-1 text-sm">
              <h4 className="font-semibold text-xs uppercase tracking-wider mb-0.5 opacity-90">{toast.title}</h4>
              <p className="text-xs opacity-90 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
