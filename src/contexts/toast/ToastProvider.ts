import { createElement, useContext, useState, type ReactNode } from "react";
import { ToastContext, type Toast, type ToastContextType } from "./ToastContex";

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let toastCounter = 0;
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };
  const createToastId = (): string => {
    return crypto.randomUUID?.() ?? `toast-${++toastCounter}`;
  };

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = createToastId();

    setToasts((prev) => [...prev, { id, ...toast }]);

    setTimeout(() => {
      removeToast(id);
    }, toast.duration ?? 4000);
  };

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
  };

  return createElement(ToastContext.Provider, { value }, children);
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
