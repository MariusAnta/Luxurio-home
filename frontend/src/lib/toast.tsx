import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

type ToastKind = 'success' | 'error' | 'info';
interface Toast { id: number; kind: ToastKind; message: string }
interface ToastCtx {
  show: (message: string, kind?: ToastKind) => void;
  success: (m: string) => void;
  error: (m: string) => void;
  info: (m: string) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const show = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = Date.now() + Math.random();
    setItems(prev => [...prev, { id, kind, message }]);
    setTimeout(() => setItems(prev => prev.filter(t => t.id !== id)), kind === 'error' ? 5000 : 3000);
  }, []);

  const api: ToastCtx = {
    show,
    success: m => show(m, 'success'),
    error: m => show(m, 'error'),
    info: m => show(m, 'info'),
  };

  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {items.map(t => (
          <div key={t.id} className={`toast toast-${t.kind}`}>
            <span className="toast-icon" aria-hidden>
              {t.kind === 'success' ? '✓' : t.kind === 'error' ? '!' : 'i'}
            </span>
            <span className="toast-msg">{t.message}</span>
            <button className="toast-close" aria-label="Dismiss"
              onClick={() => setItems(prev => prev.filter(x => x.id !== t.id))}>×</button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // Non-throwing fallback so components used outside provider don't break tests.
    return {
      show: () => {}, success: () => {}, error: () => {}, info: () => {},
    };
  }
  return ctx;
}

/** Optional: bind once at app init so non-React code can trigger toasts. */
let globalShow: ToastCtx['show'] | null = null;
export function BindGlobalToast() {
  const t = useToast();
  useEffect(() => { globalShow = t.show; return () => { globalShow = null; }; }, [t]);
  return null;
}
export const toast = {
  success: (m: string) => globalShow?.(m, 'success'),
  error: (m: string) => globalShow?.(m, 'error'),
  info: (m: string) => globalShow?.(m, 'info'),
};
