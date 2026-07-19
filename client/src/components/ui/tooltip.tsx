import * as React from 'react';

const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const TooltipRoot = ({ children, delayDuration: _delay }: { children: React.ReactNode; delayDuration?: number }) => (
  <>{children}</>
);

const TooltipTrigger = ({ children, asChild: _asChild, ...props }: any) => {
  return <>{children}</>;
};

const TooltipContent = ({ children, side: _side, sideOffset: _offset, className, ...props }: any) => (
  <span className={className} {...props}>{children}</span>
);

export { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent };
