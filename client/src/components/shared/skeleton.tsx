import { Skeleton as HeroSkeleton } from '@heroui/react';
import { cn } from '../../lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <HeroSkeleton animationType="pulse" className={cn('h-4', className)} {...props} />;
}

export function SkeletonCard() {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface p-5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonList() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-9 w-64" />
      </div>
      <div className="rounded-xl border border-border bg-surface p-4">
        <SkeletonTable rows={5} cols={5} />
      </div>
    </div>
  );
}
