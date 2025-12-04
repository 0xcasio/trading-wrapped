import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'accent';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'brutal-btn text-lg uppercase tracking-wider',
                    variant === 'primary' && 'bg-neo-main text-black',
                    variant === 'secondary' && 'bg-white text-black',
                    variant === 'accent' && 'bg-neo-accent text-white',
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';
