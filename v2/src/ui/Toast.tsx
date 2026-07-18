"use client";

/**
 * Single toast system (v1 shipped two competing ones — v2 has exactly one).
 * useToast().success/error(message); auto-dismiss; RTL-safe positioning.
 */
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface ToastItem {
  id: number;
  kind: "success" | "error";
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastCtx = createContext<ToastApi>({
  success: () => {},
  error: () => {},
});

const DISMISS_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const push = useCallback((kind: ToastItem["kind"], message: string) => {
    const id = nextId.current++;
    setToasts((list) => [...list, { id, kind, message }]);
    setTimeout(
      () => setToasts((list) => list.filter((t) => t.id !== id)),
      DISMISS_MS,
    );
  }, []);

  const api: ToastApi = {
    success: (m) => push("success", m),
    error: (m) => push("error", m),
  };

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.kind}`} role="status">
            <span aria-hidden>{t.kind === "success" ? "✓" : "✕"}</span>
            <span dir="auto">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
