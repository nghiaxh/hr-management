import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { useTranslation } from '../../context/language-context';

const SHORTCUTS = [
  { keys: 'G then D', label: 'Go to Dashboard' },
  { keys: 'G then E', label: 'Go to Employees' },
  { keys: 'G then O', label: 'Go to Departments' },
  { keys: 'G then L', label: 'Go to Leaves' },
  { keys: 'G then A', label: 'Go to Attendance' },
  { keys: 'G then P', label: 'Go to Payroll' },
  { keys: 'G then N', label: 'Go to Notifications' },
  { keys: '?', label: 'Show keyboard shortcuts' },
];

const ROUTE_MAP: Record<string, string> = {
  d: '/dashboard',
  e: '/employees',
  o: '/departments',
  l: '/leaves',
  a: '/attendance',
  p: '/payroll',
  n: '/notifications',
};

export function KeyboardShortcuts() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [helpOpen, setHelpOpen] = useState(false);
  const [keys, setKeys] = useState<string[]>([]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;

      if (e.key === '?') {
        setHelpOpen(true);
        return;
      }

      if (e.key === 'Escape') {
        setHelpOpen(false);
        return;
      }

      if (e.ctrlKey || e.metaKey) return;

      setKeys((prev) => {
        const next = [...prev, e.key.toLowerCase()];
        if (next.length > 2) return [];
        if (next.length === 2 && next[0] === 'g') {
          const route = ROUTE_MAP[next[1]];
          if (route) navigate(route);
          return [];
        }
        return next;
      });
    };

    const timeout = setTimeout(() => {
      if (keys.length > 0) setKeys([]);
    }, 1000);

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      clearTimeout(timeout);
    };
  }, [navigate, keys]);

  return (
    <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t('shortcuts.title') || 'Keyboard Shortcuts'}</DialogTitle></DialogHeader>
        <DialogDescription className="sr-only">Keyboard shortcuts reference</DialogDescription>
        <div className="space-y-2">
          {SHORTCUTS.map((s) => (
            <div key={s.keys} className="flex items-center justify-between py-1.5">
              <span className="text-sm">{s.label}</span>
              <kbd className="px-2 py-0.5 text-xs font-mono rounded border bg-muted">{s.keys}</kbd>
            </div>
          ))}
        </div>
        <Button variant="outline" onClick={() => setHelpOpen(false)} className="mt-2">Close</Button>
      </DialogContent>
    </Dialog>
  );
}
