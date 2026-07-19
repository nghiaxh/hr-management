import * as React from 'react';
import { cn } from '../../lib/utils';

function DatalistLoading({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="skeleton h-5 flex-1" />
        </div>
      ))}
    </>
  );
}

export { DatalistLoading };
