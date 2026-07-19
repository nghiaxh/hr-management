import * as React from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';

const variantToClass: Record<BadgeVariant, string> = {
  default: 'badge badge-primary',
  secondary: 'badge badge-secondary',
  destructive: 'badge badge-error',
  outline: 'badge badge-outline',
  success: 'badge badge-success',
  warning: 'badge badge-warning',
  info: 'badge badge-info',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(variantToClass[variant], 'badge-sm', className)}
      {...props}
    />
  );
}

export { Badge, type BadgeVariant as badgeVariants };
