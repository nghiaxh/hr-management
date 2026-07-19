import { ReactNode } from 'react';

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row items-start gap-4 mb-6 sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-base-content/60">{description}</p>}
      </div>
      {action && <div className="w-full sm:w-auto [&>button]:w-full sm:[&>button]:w-auto shrink-0">{action}</div>}
    </div>
  );
}
