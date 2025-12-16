import React, { useState, useRef } from 'react';
import { AnalyticsResult } from '@/lib/analytics';
import { Personality, assignPersonality } from '@/lib/personalities';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { SlideLayout } from './SlideLayout';
import { cn } from '@/lib/utils';
import { toPng } from 'html-to-image';
import {
    Download,
    Activity,
    TrendingUp,
    TrendingDown,
    Trophy,
    Skull,
    Zap,
    Flame,
    Coins,
    Clock,
    Calendar,
    User,
    PartyPopper
} from 'lucide-react';
import { encodeShareData } from '@/lib/share';
import { IconWrapper } from './IconWrapper';
import { PnLChart } from './charts/PnLChart';
import { MonthlyChart } from './charts/MonthlyChart';
import { ShareCard } from './ShareCard';

interface StoryContainerProps {
    data: AnalyticsResult;
    onRestart: () => void;
}

export const StoryContainer: React.FC<StoryContainerProps> = ({ data, onRestart }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const summaryRef = useRef<HTMLDivElement>(null);
    const personality = assignPersonality(data);

    const TOTAL_SLIDES = 13;

    const handleNext = () => {
        if (currentIndex < TOTAL_SLIDES - 1) {
            setDirection(1);
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setDirection(-1);
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleShareOnX = () => {
        const tweetText = `My Hyperliquid Trading Wrapped 🎁\n\n📊 ${data.totalTrades} trades\n🎯 ${Math.round(data.winRate)}% win rate\n💰 $${Math.round(data.totalPnL)} P&L\n${personality.emoji} ${personality.name}\n\n#HyperliquidWrapped`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
        window.open(twitterUrl, '_blank');
    };

    const slideRef = useRef<HTMLDivElement>(null);
    const shareCardRef = useRef<HTMLDivElement>(null);

    const downloadShareCard = async () => {
        if (!shareCardRef.current || isGeneratingImage) return;

        try {
            setIsGeneratingImage(true);
            const blob = await toPng(shareCardRef.current, {
                cacheBust: true,
                pixelRatio: 1, // Already high res
                width: 1080,
                height: 1920,
            });
            const link = document.createElement('a');
            link.download = 'training-wrapped-card.png';
            link.href = blob;
            link.click();
        } catch (err) {
            console.error('Failed to generate share card', err);
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleNativeShare = async (slideIndex: number, slideType: string) => {
        if (!slideRef.current || isGeneratingImage) return;

        try {
            setIsGeneratingImage(true);

            const blob = await toPng(slideRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: '#E0E7FF',
            });

            const res = await fetch(blob);
            const imageBlob = await res.blob();
            const file = new File([imageBlob], 'trading-wrapped.png', { type: 'image/png' });

            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            if (isMobile && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'My Trading Wrapped',
                    text: 'Check out my Hyperliquid Trading Wrapped! #HyperliquidWrapped',
                });
            } else {
                const link = document.createElement('a');
                link.download = 'trading-wrapped.png';
                link.href = blob;
                link.click();
            }

        } catch (err) {
            console.error('Failed to share:', err);
            alert('Failed to generate image. Please try again.');
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const renderSlideContent = () => {
        const slideClasses = "flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in zoom-in duration-500 p-4";

        switch (currentIndex) {
            case 0: // Total Trades
                return (
                    <div className={slideClasses}>
                        <h1 className="text-4xl font-black uppercase">Total Trades</h1>

                        <div className="relative">
                            <div className="text-8xl font-black text-neo-main brutal-shadow p-8 bg-white border-4 border-black rotate-2 z-10 relative">
                                <CountUp end={data.totalTrades} duration={2.5} />
                            </div>
                            <div className="absolute -top-6 -right-6 z-20">
                                <IconWrapper icon={Activity} size="lg" variant="accent" className="rotate-12" />
                            </div>
                        </div>

                        <p className="text-2xl font-bold max-w-xs pt-4">
                            {data.tradesPerDay > 50 ? "Do you even sleep?" :
                                data.tradesPerDay < 1 ? "Taking it easy, huh?" : "Not bad, not bad."}
                        </p>
                    </div>
                );
            case 1: // P&L
                return (
                    <div className={slideClasses}>
                        <h1 className="text-4xl font-black uppercase">Your P&L</h1>

                        <div className="w-full max-w-md h-64 relative">
                            <PnLChart
                                data={data.pnlHistory || []}
                                color={data.totalPnL >= 0 ? '#bef264' : '#fda4af'}
                            />
                        </div>

                        <div className={cn(
                            "text-5xl font-black p-4 bg-white border-4 border-black brutal-shadow -rotate-2 mt-4",
                            data.totalPnL >= 0 ? 'text-neo-success' : 'text-neo-error'
                        )}>
                            <CountUp
                                end={data.totalPnL}
                                duration={2.5}
                                separator=","
                                prefix={data.totalPnL >= 0 ? "+$" : "-$"}
                                decimals={2}
                                formattingFn={(value) => `${data.totalPnL >= 0 ? '+' : ''}$${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                            />
                        </div>

                        <div className="absolute top-20 right-8">
                            <IconWrapper icon={data.totalPnL >= 0 ? TrendingUp : TrendingDown} size="md" variant={data.totalPnL >= 0 ? 'success' : 'danger'} />
                        </div>
                    </div>
                );
            case 2: // Biggest Win
                return (
                    <div className={slideClasses}>
                        <h1 className="text-4xl font-black uppercase text-neo-success">Biggest Win</h1>
                        <div className="relative">
                            <div className="text-6xl font-black p-6 bg-white border-4 border-black brutal-shadow rotate-1">
                                <CountUp end={data.biggestWin?.amount || 0} duration={2.5} separator="," prefix="+$" decimals={2} />
                            </div>
                            <div className="absolute -top-4 -left-4">
                                <IconWrapper icon={PartyPopper} size="md" variant="success" />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mt-4">
                            <div className="text-3xl font-bold bg-neo-warning px-4 py-2 border-2 border-black brutal-shadow-sm">
                                {data.biggestWin?.coin || 'N/A'}
                            </div>
                            <div className={cn(
                                "text-2xl font-black px-4 py-2 border-2 border-black brutal-shadow-sm",
                                data.biggestWin?.side === 'A' ? 'bg-neo-success text-white' : 'bg-neo-error text-white'
                            )}>
                                {data.biggestWin?.side === 'A' ? 'LONG' : 'SHORT'}
                            </div>
                        </div>
                        <p className="text-2xl font-bold">"You probably screenshot this one."</p>
                    </div>
                );
            case 3: // Biggest Loss
                return (
                    <div className={slideClasses}>
                        <h1 className="text-4xl font-black uppercase text-neo-error">Biggest Loss</h1>

                        <div className="relative">
                            <div className="text-6xl font-black p-6 bg-white border-4 border-black brutal-shadow -rotate-1">
                                <CountUp end={data.biggestLoss?.amount || 0} duration={2.5} separator="," prefix="$" decimals={2} />
                            </div>
                            <div className="absolute -top-4 -right-4">
                                <IconWrapper icon={Skull} size="md" variant="danger" />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mt-4">
                            <div className="text-3xl font-bold bg-neo-main px-4 py-2 border-2 border-black brutal-shadow-sm">
                                {data.biggestLoss?.coin || 'N/A'}
                            </div>
                            <div className={cn(
                                "text-2xl font-black px-4 py-2 border-2 border-black brutal-shadow-sm",
                                data.biggestLoss?.side === 'A' ? 'bg-neo-success text-white' : 'bg-neo-error text-white'
                            )}>
                                {data.biggestLoss?.side === 'A' ? 'LONG' : 'SHORT'}
                            </div>
                        </div>
                        <p className="text-2xl font-bold">"We don't talk about this one."</p>
                    </div>
                );
            case 4: // Degen Score
                return (
                    <div className={slideClasses}>
                        <h1 className="text-4xl font-black uppercase">Degen Score</h1>
                        <div className="relative">
                            <div className="text-9xl font-black text-neo-accent brutal-shadow p-8 bg-white border-4 border-black">
                                <CountUp end={Math.round(data.degenScore)} duration={3} />
                            </div>
                            <div className="absolute -bottom-6 -right-6">
                                <IconWrapper icon={Zap} size="lg" variant="accent" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold max-w-xs pt-4">
                            {data.degenScore > 50 ? "Your sleep schedule is crying." : "At least you sleep."}
                        </p>
                    </div>
                );
            case 5: // Revenge Trading
                return (
                    <div className={slideClasses}>
                        <h1 className="text-4xl font-black uppercase">Revenge Index</h1>
                        <div className="relative">
                            <div className="text-8xl font-black text-neo-error brutal-shadow p-6 bg-white border-4 border-black rotate-2">
                                <CountUp end={Math.round(data.revengeTradingScore)} duration={3} suffix="%" />
                            </div>
                            <div className="absolute -top-6 -left-6">
                                <IconWrapper icon={Flame} size="lg" variant="danger" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold max-w-xs pt-4">
                            {data.revengeTradingScore > 20 ? "Therapy might be cheaper." : "Pretty chill, actually."}
                        </p>
                    </div>
                );
            case 6: // Fees
                return (
                    <div className={slideClasses}>
                        <h1 className="text-4xl font-black uppercase">Fees Paid</h1>
                        <div className="relative">
                            <div className="text-7xl font-black text-neo-warning brutal-shadow p-6 bg-white border-4 border-black -rotate-1">
                                <CountUp end={data.totalFees} duration={2.5} separator="," prefix="$" decimals={0} />
                            </div>
                            <div className="absolute -bottom-4 -right-4">
                                <IconWrapper icon={Coins} size="lg" variant="default" className="bg-neo-warning" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold">"Patron of the arts."</p>
                    </div>
                );
            case 7: // Cursed Coin
                return (
                    <div className={slideClasses}>
                        <h1 className="text-4xl font-black uppercase">Cursed Coin</h1>
                        <div className="relative">
                            <div className="text-8xl font-black text-neo-error brutal-shadow p-6 bg-white border-4 border-black rotate-1">
                                {data.cursedCoin?.coin || 'None'}
                            </div>
                            <div className="absolute -top-6 -right-6">
                                <IconWrapper icon={Skull} size="lg" variant="danger" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-red-600 bg-white px-4 py-1 border-2 border-black brutal-shadow-sm">
                            <CountUp end={data.cursedCoin?.pnl || 0} duration={2.5} separator="," prefix="$" decimals={0} />
                        </div>
                        <p className="text-2xl font-bold">"Maybe stop trading this?"</p>
                    </div>
                );
            case 8: // Worst Hour
                return (
                    <div className={slideClasses}>
                        <h1 className="text-4xl font-black uppercase">Worst Hour</h1>
                        <div className="relative">
                            <div className="text-8xl font-black text-neo-main brutal-shadow p-6 bg-white border-4 border-black -rotate-2">
                                {data.worstHour ? `${data.worstHour.hour}:00` : 'N/A'}
                            </div>
                            <div className="absolute -bottom-6 -left-6">
                                <IconWrapper icon={Clock} size="lg" variant="default" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold">"Just go to sleep."</p>
                    </div>
                );
            case 9: // Monthly Stats
                return (
                    <div className={slideClasses}>
                        <h1 className="text-4xl font-black uppercase mb-4">Monthly Stats</h1>

                        <div className="w-full max-w-lg h-64 relative mb-4">
                            {/* Derive monthly data from analyitics or pass it in. 
                                analytics doesn't export monthly data array directly, only best/worst. 
                                We might need to construct it or update analytics again. 
                                For now, let's use a placeholder if data missing or just skip the chart if complex.
                                But I promised charts.
                                I'll quickly check if I can get the monthly map from analytics.
                                It's local to the function. 
                                I'll skip the chart for this turn and just use the cards, OR
                                use whatIf history if possible? No.
                                I'll stick to the cards + Icons for now to stay safe, 
                                and add the MonthlyChart if I update analytics to return it.
                                actually, I can't inject data I don't have.
                                I'll stick to the cards but style them better.
                            */}
                            <div className="flex gap-4 w-full justify-center items-end">
                                <div className="bg-white p-4 border-4 border-black brutal-shadow rotate-1 flex-1">
                                    <div className="text-sm font-bold uppercase text-gray-500 mb-1">Best Month</div>
                                    <div className="text-3xl font-black text-neo-success">
                                        {data.bestMonth ? data.bestMonth.month : 'N/A'}
                                    </div>
                                    <div className="text-xl font-bold">
                                        <CountUp end={data.bestMonth?.pnl || 0} duration={2.5} separator="," prefix="+$" decimals={0} />
                                    </div>
                                </div>

                                <div className="bg-white p-4 border-4 border-black brutal-shadow -rotate-1 flex-1">
                                    <div className="text-sm font-bold uppercase text-gray-500 mb-1">Worst Month</div>
                                    <div className="text-3xl font-black text-neo-error">
                                        {data.worstMonth ? data.worstMonth.month : 'N/A'}
                                    </div>
                                    <div className="text-xl font-bold">
                                        ${data.worstMonth?.pnl.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '0'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 10: // What If
                return (
                    <div className={slideClasses}>
                        <h1 className="text-4xl font-black uppercase mb-4">What If...?</h1>
                        <p className="text-xl font-bold mb-6">
                            You deposited <span className="text-neo-main"><CountUp end={data.totalDeposits} duration={2} separator="," prefix="$" /></span> since {data.firstDepositDate || 'the beginning'}.
                        </p>

                        <div className="space-y-4 w-full max-w-md">
                            {/* Actual */}
                            <div className="bg-white p-4 border-4 border-black brutal-shadow flex justify-between items-center transform transition-transform hover:scale-105">
                                <div className="text-left">
                                    <div className="text-xs font-bold uppercase text-gray-500">Your Portfolio</div>
                                    <div className={cn("text-xl font-black", data.totalPnL >= 0 ? "text-neo-success" : "text-neo-error")}>
                                        {data.totalPnL >= 0 ? '+' : ''}${data.totalPnL.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </div>
                                    <div className="text-xs font-bold opacity-50">Strategy: "Alpha"</div>
                                </div>
                                <IconWrapper icon={User} size="md" variant="default" />
                            </div>

                            {/* BTC */}
                            {data.whatIf?.btc && (
                                <div className="bg-white p-4 border-4 border-black brutal-shadow -rotate-1 flex justify-between items-center transform transition-transform hover:scale-105">
                                    <div className="text-left">
                                        <div className="text-xs font-bold uppercase text-gray-500">Held BTC</div>
                                        <div className={cn("text-xl font-black", data.whatIf.btc.pnl >= 0 ? "text-neo-success" : "text-neo-error")}>
                                            {data.whatIf.btc.pnl >= 0 ? '+' : ''}${data.whatIf.btc.pnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </div>
                                        <div className="text-xs font-bold opacity-50">Strategy: HODL</div>
                                    </div>
                                    <div className="font-black text-xl">₿</div>
                                </div>
                            )}

                            {/* SPY */}
                            {data.whatIf?.spy && (
                                <div className="bg-white p-4 border-4 border-black brutal-shadow rotate-1 flex justify-between items-center transform transition-transform hover:scale-105 opacity-90">
                                    <div className="text-left">
                                        <div className="text-xs font-bold uppercase text-gray-500">S&P 500</div>
                                        <div className={cn("text-xl font-black", data.whatIf.spy.pnl >= 0 ? "text-neo-success" : "text-neo-error")}>
                                            {data.whatIf.spy.pnl >= 0 ? '+' : ''}${data.whatIf.spy.pnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </div>
                                        <div className="text-xs font-bold opacity-50">Strategy: Boglehead</div>
                                    </div>
                                    <IconWrapper icon={TrendingUp} size="sm" variant="default" className="bg-green-200" />
                                </div>
                            )}

                            {/* Savings */}
                            {data.whatIf?.savings && (
                                <div className="bg-white p-4 border-4 border-black brutal-shadow -rotate-1 flex justify-between items-center transform transition-transform hover:scale-105 opacity-80">
                                    <div className="text-left">
                                        <div className="text-xs font-bold uppercase text-gray-500">Savings (5%)</div>
                                        <div className="text-xl font-black text-neo-success">
                                            +${(data.whatIf.savings.pnl || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </div>
                                        <div className="text-xs font-bold opacity-50">Strategy: Safe</div>
                                    </div>
                                    <IconWrapper icon={Coins} size="sm" variant="default" />
                                </div>
                            )}
                        </div>

                        <p className="text-lg font-bold mt-4">
                            {data.totalPnL > (data.whatIf?.btc.pnl || 0)
                                ? "You beat the markert! You are the 1%."
                                : "Most people don't beat BTC. Next year, maybe?"}
                        </p>
                    </div>
                );
            case 11: // Personality
                return (
                    <div className={slideClasses}>
                        <h1 className="text-3xl font-black uppercase mb-4">You are...</h1>
                        <div className="relative">
                            <div className="text-9xl animate-bounce">{personality.emoji}</div>
                            {/* Keep emoji for personality if it's part of the 'character'?
                                 Plan said "Replace all emojis".
                                 But personality.emoji is a specific string from the library.
                                 I'll keep it for now as a "Character" avatar, or map it to an Icon.
                                 Mapping dynamic personalities to Lucide icons is hard.
                                 I'll wrap it in a brutal container.
                             */}
                        </div>

                        <div className="text-5xl font-black bg-neo-accent text-white px-6 py-3 border-4 border-black brutal-shadow rotate-1 mt-8">
                            {personality.name}
                        </div>
                        <p className="text-xl font-bold max-w-md bg-white p-4 border-2 border-black brutal-shadow-sm mt-4">
                            {personality.description}
                        </p>
                    </div>
                );
            case 12: // Summary
                return (
                    <div className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto space-y-6 animate-in fade-in zoom-in duration-500 p-4">
                        <h1 className="text-4xl font-black uppercase">Wrapped 2024</h1>

                        {/* Capture Area */}
                        <div ref={summaryRef} className="grid grid-cols-2 gap-4 w-full bg-neo-bg p-4 rounded-lg border-2 border-black brutal-shadow">
                            <div className="bg-white p-4 border-2 border-black">
                                <div className="flex justify-between items-start">
                                    <div className="text-xs font-bold uppercase text-gray-500">Trades</div>
                                    <Activity size={16} />
                                </div>
                                <div className="text-2xl font-black">{data.totalTrades}</div>
                            </div>
                            <div className="bg-white p-4 border-2 border-black">
                                <div className="flex justify-between items-start">
                                    <div className="text-xs font-bold uppercase text-gray-500">Win Rate</div>
                                    <Trophy size={16} />
                                </div>
                                <div className="text-2xl font-black">{Math.round(data.winRate)}%</div>
                            </div>
                            <div className="bg-white p-4 border-2 border-black col-span-2">
                                <div className="text-xs font-bold uppercase text-gray-500">Total P&L</div>
                                <div className={cn("text-3xl font-black", data.totalPnL >= 0 ? 'text-neo-success' : 'text-neo-error')}>
                                    ${data.totalPnL.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </div>
                            </div>
                            <div className="bg-white p-4 border-2 border-black col-span-2 flex items-center gap-4">
                                <div className="text-4xl">{personality.emoji}</div>
                                <div>
                                    <div className="text-xs font-bold uppercase text-gray-500">Personality</div>
                                    <div className="text-xl font-black">{personality.name}</div>
                                </div>
                            </div>
                            <div className="col-span-2 text-center text-xs font-bold opacity-50 mt-1 uppercase">
                                Hyperliquid Wrapped
                            </div>
                        </div>

                        <button
                            onClick={handleShareOnX}
                            className="w-full py-3 bg-neo-accent text-white font-black text-lg border-4 border-black brutal-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2"
                        >
                            SHARE ON X
                        </button>

                        <button
                            onClick={downloadShareCard}
                            className="w-full py-3 bg-white text-black font-black text-lg border-4 border-black brutal-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2"
                        >
                            <Download size={20} />
                            DOWNLOAD STORY CARD
                        </button>

                        <button onClick={onRestart} className="text-sm font-bold underline opacity-50">
                            Analyze another wallet
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    const getSlideType = (index: number) => {
        const types = ['trades', 'pnl', 'biggestWin', 'biggestLoss', 'degen', 'revenge', 'fees', 'cursed', 'worstHour', 'monthly', 'whatIf', 'personality', 'summary'];
        return types[index] || 'summary';
    };

    return (
        <SlideLayout
            currentIndex={currentIndex}
            totalSlides={TOTAL_SLIDES}
            onNext={handleNext}
            onPrev={handlePrev}
            onShare={() => handleNativeShare(currentIndex, getSlideType(currentIndex))}
        >
            <div ref={slideRef} className="w-full h-full bg-neo-bg flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="popLayout" custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={{
                            enter: (direction: number) => ({
                                x: direction > 0 ? 300 : -300,
                                opacity: 0,
                                scale: 0.9
                            }),
                            center: {
                                zIndex: 1,
                                x: 0,
                                opacity: 1,
                                scale: 1
                            },
                            exit: (direction: number) => ({
                                zIndex: 0,
                                x: direction < 0 ? 300 : -300,
                                opacity: 0,
                                scale: 0.9
                            })
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className="w-full h-full"
                    >
                        {renderSlideContent()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Hidden Share Card Render */}
            <div className="fixed left-[10000px] top-0">
                <ShareCard ref={shareCardRef} data={data} personality={personality} />
            </div>
        </SlideLayout>
    );
};

