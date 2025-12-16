import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';

interface SlideLayoutProps {
    children: React.ReactNode;
    onNext: () => void;
    onPrev: () => void;
    onShare?: () => void;
    currentIndex: number;
    totalSlides: number;
    className?: string;
    bgClass?: string;
}

export const SlideLayout: React.FC<SlideLayoutProps> = ({
    children,
    onNext,
    onPrev,
    onShare,
    currentIndex,
    totalSlides,
    className,
    bgClass = 'bg-neo-bg',
}) => {
    const [touchStart, setTouchStart] = React.useState<number | null>(null);
    const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    // Keyboard navigation
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                onPrev();
            } else if (e.key === 'ArrowRight') {
                onNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onNext, onPrev]);

    // Touch handlers for swipe
    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            onNext();
        } else if (isRightSwipe) {
            onPrev();
        }
    };

    return (
        <div
            className={cn('relative h-screen w-full overflow-hidden flex flex-col', bgClass)}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 z-50 flex gap-1 p-2">
                {Array.from({ length: totalSlides }).map((_, idx) => (
                    <div
                        key={idx}
                        className="h-1 flex-1 rounded-full bg-black/20 overflow-hidden"
                    >
                        <div
                            className={cn(
                                'h-full bg-black transition-all duration-300',
                                idx < currentIndex ? 'w-full' : idx === currentIndex ? 'w-full animate-progress' : 'w-0'
                            )}
                        />
                    </div>
                ))}
            </div>

            {/* Share Button */}
            {onShare && (
                <button
                    onClick={(e) => { e.stopPropagation(); onShare(); }}
                    className="absolute top-4 right-4 z-50 p-3 bg-black text-white brutal-border brutal-shadow rounded-full hover:scale-110 transition-transform"
                    aria-label="Download or Share Slide"
                >
                    <Download className="w-5 h-5" />
                </button>
            )}

            {/* Navigation Zones (Mobile/Desktop) */}
            <div className="absolute inset-0 z-10 flex">
                <div className="w-1/3 h-full" onClick={onPrev} />
                <div className="w-1/3 h-full" /> {/* Center dead zone for interaction */}
                <div className="w-1/3 h-full" onClick={onNext} />
            </div>

            {/* Content */}
            <div
                className={cn('relative z-20 flex-1 flex flex-col p-6 pt-12 pb-24', className)}
            >
                {children}
            </div>

            {/* Visible Navigation Buttons */}
            <button
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                className="absolute left-4 bottom-8 z-30 p-3 bg-white brutal-border brutal-shadow rounded-full hover:scale-110 transition-transform disabled:opacity-50"
                disabled={currentIndex === 0}
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                className="absolute right-4 bottom-8 z-30 p-3 bg-white brutal-border brutal-shadow rounded-full hover:scale-110 transition-transform disabled:opacity-50"
                disabled={currentIndex === totalSlides - 1}
            >
                <ChevronRight className="w-6 h-6" />
            </button>
        </div>
    );
};
