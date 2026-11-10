import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);
export const DURACION_TOAST = 3800;

// Mensajes emergentes (Bootstrap Toast) que se cierran solos
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const siguiente = useRef(1);
  const timers = useRef([]);

  const mostrarToast = useCallback((mensaje, tipo = 'ok') => {
    const id = siguiente.current++;
    setToasts((lista) => [...lista, { id, mensaje, tipo }]);
    const t = setTimeout(() => setToasts((lista) => lista.filter((x) => x.id !== id)), DURACION_TOAST);
    timers.current.push(t);
  }, []);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const value = useMemo(() => ({ mostrarToast }), [mostrarToast]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container position-fixed bottom-0 start-50 translate-middle-x p-3" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast show lug-toast lug-toast--${t.tipo} mb-2`} role="status">
            <div className="toast-body">{t.mensaje}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}
