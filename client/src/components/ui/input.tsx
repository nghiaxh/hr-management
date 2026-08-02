import * as React from 'react';
import { Input as HeroInput } from '@heroui/react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <HeroInput
      ref={ref as React.Ref<HTMLInputElement>}
      type={type}
      className={cn('w-full', className)}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
