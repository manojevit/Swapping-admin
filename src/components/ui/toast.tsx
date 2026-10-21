"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "success" | "info" | "warn";
interface Toast {
  id: number;
  title: string;
  description?: string;
  tone: Tone;
}

interface ToastValue {
  show: (title: string, opts?: { description?: string; tone?: Tone }) => void;
}

const ToastContext = createContext<ToastValue | null>(null);

const ICON: Record<Tone, ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-success" />,
  info: <Info className="h-5 w-5 text-brand-600" />,
  warn: <TriangleAlert className="h-5 w-5 text-warn" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const show = useCallback<ToastValue["show"]>((title, opts) => {
    const id = Date.now() + Math.random();
    const toast: Toast = { id, title, description: opts?.description, tone: opts?.tone ?? "success" };
    setToasts((t) => [...t, toast]);
    setTimeout(() => remove(id), 3600);
  }, [remove]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-[340px] max-w-[calc(100vw-2.5rem)] flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="animate-pop pointer-events-auto flex items-start gap-3 rounded-xl border border-line bg-surface p-3.5 shadow-pop">
            <span className="mt-0.5 shrink-0">{ICON[t.tone]}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-ink">{t.title}</p>
              {t.description ? <p className="mt-0.5 text-[12px] text-muted">{t.description}</p> : null}
            </div>
            <button onClick={() => remove(t.id)} className="shrink-0 text-faint hover:text-ink"><X className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastValue {
  const ctx = useContext(ToastContext);
  // A no-op fallback keeps components usable outside a provider (e.g. tests).
  return ctx ?? { show: () => {} };
}
