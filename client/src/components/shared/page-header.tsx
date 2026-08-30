import { ReactNode } from 'react';

export function PageHeader({ action }: { action?: ReactNode }) {
  if (!action) return null;
  return (
    <div className="flex justify-end mb-6">
      <div className="w-full sm:w-auto [&>button]:w-full sm:[&>button]:w-auto shrink-0">{action}</div>
    </div>
  );
}