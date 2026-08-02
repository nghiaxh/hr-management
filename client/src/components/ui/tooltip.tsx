import * as React from 'react';
import { Tooltip } from '@heroui/react';
import { cn } from '../../lib/utils';

const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const TooltipRoot = ({ children, delayDuration, ...props }: { children: React.ReactNode; delayDuration?: number }) => (
  <Tooltip.Root delay={delayDuration} {...props}>
    {children}
  </Tooltip.Root>
);

const TooltipTrigger = ({ children, asChild: _asChild, ...props }: any) => (
  <Tooltip.Trigger {...props}>{children}</Tooltip.Trigger>
);

const TooltipContent = ({ children, side: _side, sideOffset, className, ...props }: any) => (
  <Tooltip.Content offset={sideOffset} showArrow={false} className={cn('z-50', className)} {...props}>
    {children}
  </Tooltip.Content>
);

export { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent };
