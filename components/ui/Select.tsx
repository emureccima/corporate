import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, children, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <select
          className={cn(
            'block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder:text-gray-400',
            'bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500',
            'transition-colors duration-200 text-base md:text-sm',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'min-h-[44px] touch-manipulation',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="text-sm text-red-600 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };