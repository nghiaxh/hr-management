import * as React from 'react';
import { cn } from '../../lib/utils';

type VariantMap = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'primary';
type SizeMap = 'default' | 'sm' | 'lg' | 'icon';

const variantToClass: Record<VariantMap, string> = {
  default: 'btn btn-primary',
  primary: 'btn btn-primary',
  destructive: 'btn btn-error',
  outline: 'btn btn-outline',
  secondary: 'btn btn-secondary',
  ghost: 'btn btn-ghost',
  link: 'btn btn-link',
};

const sizeToClass: Record<SizeMap, string> = {
  default: 'btn-md',
  sm: 'btn-sm',
  lg: 'btn-lg',
  icon: 'btn-square btn-sm',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: VariantMap;
  size?: SizeMap;
  asChild?: boolean;
  isPending?: boolean;
  onPress?: () => void;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', type, children, isPending, disabled, onClick, onPress, ...props }, ref) => {
    const classes = cn(
      variantToClass[variant],
      sizeToClass[size],
      isPending && 'loading',
      className,
    );

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onPress) onPress();
      if (onClick) onClick(e);
    };

    return (
      <button
        ref={ref}
        type={type || 'button'}
        className={classes}
        disabled={disabled || isPending}
        onClick={handleClick}
        {...props}
      >
        {isPending ? <span className="loading loading-spinner loading-sm" /> : children}
      </button>
    );
  },
);
Button.displayName = 'Button';

export { Button };
