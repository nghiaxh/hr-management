import * as React from 'react';
import { Chip } from '@heroui/react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';

const variantToChip = {
  default: { color: 'accent', variant: 'soft' },
  secondary: { color: 'default', variant: 'secondary' },
  destructive: { color: 'danger', variant: 'soft' },
  outline: { color: 'default', variant: 'tertiary' },
  success: { color: 'success', variant: 'soft' },
  warning: { color: 'warning', variant: 'soft' },
  info: { color: 'accent', variant: 'soft' },
} as const;

export interface BadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color' | 'size'> {
  variant?: BadgeVariant;
}

function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const { color, variant: chipVariant } = variantToChip[variant];
  return (
    <Chip
      size="sm"
      color={color}
      variant={chipVariant}
      className={cn('font-medium', className)}
      {...(props as any)}
    >
      {children}
    </Chip>
  );
}

export { Badge, type BadgeVariant as badgeVariants };
