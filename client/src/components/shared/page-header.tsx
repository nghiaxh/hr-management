import { ReactNode } from 'react';

export function PageHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-2 mb-6 md:flex-row md:items-center md:justify-between">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
      {action && <div className="w-full md:w-auto [&>button]:w-full md:[&>button]:w-auto">{action}</div>}
    </div>
  );
}
