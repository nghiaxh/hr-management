import { cn } from '../../lib/utils';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: any;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon = Inbox, title = 'No data', description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 gap-3 text-center', className)}>
      <div className="h-12 w-12 rounded-full bg-base-300/50 flex items-center justify-center">
        <Icon className="h-6 w-6 text-base-content/40" />
      </div>
      <div>
        <p className="text-sm font-medium text-base-content/60">{title}</p>
        {description && <p className="text-xs text-base-content/40 mt-0.5">{description}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
