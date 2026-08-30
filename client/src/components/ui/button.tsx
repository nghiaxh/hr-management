import * as React from 'react';
import { Button as HeroButton, Spinner } from '@heroui/react';

type VariantMap = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
type SizeMap = 'default' | 'sm' | 'lg' | 'icon';

const variantToHero: Record<VariantMap, 'primary' | 'danger' | 'outline' | 'secondary' | 'ghost'> = {
  default: 'primary',
  destructive: 'danger',
  outline: 'outline',
  secondary: 'secondary',
  ghost: 'ghost',
};

const sizeToHero: Record<SizeMap, 'sm' | 'md' | 'lg'> = {
  default: 'md',
  sm: 'sm',
  lg: 'lg',
  icon: 'sm',
};

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  variant?: VariantMap;
  size?: SizeMap;
  isPending?: boolean;
  onPress?: () => void;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', type, children, isPending, disabled, onClick, onPress, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onPress) onPress();
      if (onClick) onClick(e);
    };

    return (
      <HeroButton
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type || 'button'}
        variant={variantToHero[variant]}
        size={size === 'icon' ? 'sm' : sizeToHero[size]}
        isIconOnly={size === 'icon'}
        isDisabled={disabled || isPending}
        onClick={handleClick}
        className={className}
        {...(props as any)}
      >
        {isPending && <Spinner size="sm" color="current" />}
        {children}
      </HeroButton>
    );
  },
);
Button.displayName = 'Button';

export { Button };
