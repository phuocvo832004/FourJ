import React from 'react';
import { cn } from '../../utils/tailwind';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, shadow = 'md', border = true, padding = 'md', ...props }, ref) => {
    const shadowVariants = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow',
      lg: 'shadow-lg'
    };

    const paddingVariants = {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6'
    };

    return (
      <div
        className={cn(
          'rounded-lg bg-white',
          shadowVariants[shadow],
          paddingVariants[padding],
          border && 'border border-gray-200',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = React.forwardRef<
  HTMLDivElement, 
  React.HTMLAttributes<HTMLDivElement>
>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn('mb-3 flex flex-col space-y-1.5', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<
  HTMLHeadingElement, 
  React.HTMLAttributes<HTMLHeadingElement>
>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        className={cn('text-lg font-semibold text-gray-900', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<
  HTMLParagraphElement, 
  React.HTMLAttributes<HTMLParagraphElement>
>(
  ({ className, ...props }, ref) => {
    return (
      <p
        className={cn('text-sm text-gray-500', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<
  HTMLDivElement, 
  React.HTMLAttributes<HTMLDivElement>
>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn('', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<
  HTMLDivElement, 
  React.HTMLAttributes<HTMLDivElement>
>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn('mt-4 flex items-center', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

CardFooter.displayName = 'CardFooter'; 