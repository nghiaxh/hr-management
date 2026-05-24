import { useEffect, useState } from 'react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

type Listener = (toasts: Toast[]) => void;

let toastId = 0;
let globalToasts: Toast[] = [];
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach(fn => fn([...globalToasts]));
}

export function toast(t: Omit<Toast, 'id'>) {
  const id = String(++toastId);
  const entry: Toast = { ...t, id };
  globalToasts = [...globalToasts, entry];
  notify();
  setTimeout(() => {
    globalToasts = globalToasts.filter(t => t.id !== id);
    notify();
  }, 5000);
  return entry;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    listeners.add(setToasts);
    setToasts([...globalToasts]);
    return () => { listeners.delete(setToasts); };
  }, []);

  return { toasts, toast, dismiss: (id: string) => {
    globalToasts = globalToasts.filter(t => t.id !== id);
    notify();
  }};
}
