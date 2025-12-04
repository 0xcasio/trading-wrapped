import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={cn(
                    'w-full bg-white px-4 py-3 text-lg outline-none transition-all',
                    'brutal-border brutal-shadow focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none',
                    'placeholder:text-gray-500',
                    className
                )}
                {...props}
            />
        );
    }
);
Input.displayName = 'Input';
