import { useToast } from '../../hooks/use-toast';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map(t => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg text-sm transition-all animate-in slide-in-from-right-full',
            t.variant === 'destructive' ? 'bg-destructive text-destructive-foreground border-destructive' : 'bg-background text-foreground'
          )}
        >
          <div className="flex-1">
            <p className="font-semibold">{t.title}</p>
            {t.description && <p className="text-xs opacity-80 mt-0.5">{t.description}</p>}
          </div>
          <button onClick={() => dismiss(t.id)} className="shrink-0 opacity-60 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
