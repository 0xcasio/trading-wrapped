import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconWrapperProps {
    icon: LucideIcon;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    variant?: 'default' | 'accent' | 'success' | 'danger' | 'warning';
}

const variants = {
    default: 'bg-white text-black',
    accent: 'bg-[#a388ee] text-black', // Soft purple
    success: 'bg-[#bef264] text-black', // Lime
    danger: 'bg-[#fda4af] text-black', // Light red
    warning: 'bg-[#facc15] text-black', // Yellow
};

const sizes = {
    sm: 'p-2 w-8 h-8',
    md: 'p-3 w-12 h-12',
    lg: 'p-4 w-16 h-16',
    xl: 'p-6 w-24 h-24',
};

const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
};

export function IconWrapper({ icon: Icon, size = 'md', className, variant = 'default' }: IconWrapperProps) {
    return (
        <div
            className={cn(
                'flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]',
                variants[variant],
                sizes[size],
                className
            )}
        >
            <Icon size={iconSizes[size]} strokeWidth={2.5} />
        </div>
    );
}
