import * as React from 'react';
import { Tooltip } from '@heroui/react';
import { cn } from '../../lib/utils';

const TooltipRoot = ({ children, delayDuration, ...props }: { children: React.ReactNode; delayDuration?: number }) => (
  <Tooltip.Root delay={delayDuration} {...props}>
    {children}
  </Tooltip.Root>
);

const TooltipTrigger = ({ children, ...props }: { children: React.ReactNode }) => (
  <Tooltip.Trigger {...props}>{children}</Tooltip.Trigger>
);

const TooltipContent = ({ children, className, sideOffset, ...props }: {
  children: React.ReactNode;
  className?: string;
  sideOffset?: number;
}) => (
  <Tooltip.Content offset={sideOffset} showArrow={false} className={cn('z-50', className)} {...props}>
    {children}
  </Tooltip.Content>
);

export { TooltipRoot, TooltipTrigger, TooltipContent };