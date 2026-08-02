import { useEffect, useState } from 'react';
import { useToast } from '../../hooks/use-toast';
import { X } from '@phosphor-icons/react';
import { cn } from '../../lib/utils';

export function Toaster() {
  const { toasts, dismiss } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm" role="status" aria-live="polite" aria-label="Notifications">
      {toasts.map(t => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm animate-in slide-in-from-right-full fade-in duration-300',
            'bg-surface border-border text-foreground shadow-lg',
            t.variant === 'destructive' && 'border-danger/40 bg-danger-soft',
          )}
        >
          <div className="flex-1">
            <p className="font-semibold">{t.title}</p>
            {t.description && <p className="text-xs opacity-80 mt-0.5">{t.description}</p>}
          </div>
          <button onClick={() => dismiss(t.id)} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer" aria-label="Dismiss notification">
            <X weight="bold" className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
