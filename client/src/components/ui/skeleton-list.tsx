import * as React from 'react';
import { Skeleton as HeroSkeleton } from '@heroui/react';

function DatalistLoading({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <HeroSkeleton animationType="pulse" className="h-5 flex-1" />
        </div>
      ))}
    </>
  );
}

export { DatalistLoading };
