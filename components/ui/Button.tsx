import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:pointer-events-none touch-manipulation';
    
    const variants = {
      primary: 'bg-foreground text-background hover:bg-neutral-800',
      accent: 'bg-accent text-accent-foreground hover:bg-orange-600',
      ghost: 'hover:bg-neutral-100 text-foreground',
      outline: 'border border-border bg-background hover:bg-neutral-50',
    };
    
    const sizes = {
      sm: 'min-h-[36px] h-9 px-3 text-sm rounded-md',
      md: 'min-h-[44px] h-11 px-6 text-base rounded-lg',
      lg: 'min-h-[48px] h-14 px-8 text-lg rounded-lg',
    };

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          isLoading && 'pointer-events-none',
          className
        )}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };