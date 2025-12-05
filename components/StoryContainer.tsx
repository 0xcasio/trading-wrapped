import React, { useState, useRef } from 'react';
import { AnalyticsResult } from '@/lib/analytics';
import { Personality, assignPersonality } from '@/lib/personalities';
import { SlideLayout } from './SlideLayout';
import { cn } from '@/lib/utils';
import { toPng } from 'html-to-image';
import { Loader2, Download } from 'lucide-react';
import { encodeShareData } from '@/lib/share';

interface StoryContainerProps {
    data: AnalyticsResult;
    onRestart: () => void;
}

export const StoryContainer: React.FC<StoryContainerProps> = ({ data, onRestart }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const summaryRef = useRef<HTMLDivElement>(null);
    const personality = assignPersonality(data);

    const TOTAL_SLIDES = 12;



    const handleNext = () => {
        if (currentIndex < TOTAL_SLIDES - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleShareOnX = () => {
        const tweetText = `My Hyperliquid Trading Wrapped 🎁\n\n📊 ${data.totalTrades} trades\n🎯 ${Math.round(data.winRate)}% win rate\n💰 $${Math.round(data.totalPnL)} P&L\n${personality.emoji} ${personality.name}\n\n#HyperliquidWrapped\n\nhttps://trading-wrapped.vercel.app/`;

        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

        window.open(twitterUrl, '_blank');
    };

    const slideRef = useRef<HTMLDivElement>(null);

    const handleNativeShare = async (slideIndex: number, slideType: string) => {
        if (!slideRef.current || isGeneratingImage) return;

        try {
            setIsGeneratingImage(true);

            // Generate image from the slide
            const blob = await toPng(slideRef.current, {
                cacheBust: true,
                pixelRatio: 2, // Higher quality
                backgroundColor: '#E0E7FF', // bg-neo-bg
            });

            // Convert data URL to Blob
            const res = await fetch(blob);
            const imageBlob = await res.blob();
            const file = new File([imageBlob], 'trading-wrapped.png', { type: 'image/png' });

            let tweetText = '';
            switch (slideType) {
                case 'trades':
                    tweetText = `I made ${data.totalTrades} trades on Hyperliquid! 📊`;
                    break;
                case 'pnl':
                    tweetText = `My Hyperliquid P&L: $${Math.round(data.totalPnL)} 💰`;
                    break;
                case 'biggestWin':
                    tweetText = `My biggest win on Hyperliquid: +$${data.biggestWin?.amount.toLocaleString() || '0'} on ${data.biggestWin?.coin || 'N/A'}! 🚀`;
                    break;
                case 'biggestLoss':
                    tweetText = `My biggest loss on Hyperliquid: $${data.biggestLoss?.amount.toLocaleString() || '0'} on ${data.biggestLoss?.coin || 'N/A'} 😅`;
                    break;
                case 'degen':
                    tweetText = `My Degen Score: ${Math.round(data.degenScore)}/100 🦍`;
                    break;
                case 'revenge':
                    tweetText = `My Revenge Trading Index: ${Math.round(data.revengeTradingScore)}% 😤`;
                    break;
                case 'fees':
                    tweetText = `I paid $${data.totalFees.toLocaleString(undefined, { maximumFractionDigits: 0 })} in fees on Hyperliquid 💸`;
                    break;
                case 'cursed':
                    tweetText = `My cursed coin: ${data.cursedCoin?.coin || 'None'} ($${data.cursedCoin?.pnl.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '0'}) 👻`;
                    break;
                case 'worstHour':
                    tweetText = `My worst trading hour: ${data.worstHour ? `${data.worstHour.hour}:00` : 'N/A'} ⏰`;
                    break;
                case 'monthly':
                    tweetText = `Best Month: ${data.bestMonth?.month} (+$${Math.round(data.bestMonth?.pnl || 0)}) 📈\nWorst Month: ${data.worstMonth?.month} ($${Math.round(data.worstMonth?.pnl || 0)}) 📉`;
                    break;
                case 'personality':
                    tweetText = `My trader personality: ${personality.emoji} ${personality.name}`;
                    break;
                default:
                    tweetText = `Check out my Hyperliquid Trading Wrapped!`;
            }

            // Add hashtag
            tweetText += `\n\n#HyperliquidWrapped`;

            // Check if on mobile device (not just if share API is available)
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            if (isMobile && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                // Mobile: Use native share
                await navigator.share({
                    files: [file],
                    title: 'My Trading Wrapped',
                    text: tweetText,
                });
            } else {
                // Desktop: Direct download
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
        switch (currentIndex) {
            case 0: // Total Trades
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                        <h1 className="text-4xl font-black uppercase">Total Trades</h1>
                        <div className="text-8xl font-black text-neo-main brutal-shadow p-6 bg-white border-4 border-black rotate-2">
                            {data.totalTrades}
                        </div>
                        <p className="text-2xl font-bold max-w-xs">
                            {data.tradesPerDay > 50 ? "Do you even sleep?" :
                                data.tradesPerDay < 1 ? "Taking it easy, huh?" : "Not bad, not bad."}
                        </p>
                    </div>
                );
            case 1: // P&L
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                        <h1 className="text-4xl font-black uppercase">Total P&L</h1>
                        <div className={cn(
                            "text-6xl font-black p-6 bg-white border-4 border-black brutal-shadow -rotate-2",
                            data.totalPnL >= 0 ? 'text-neo-success' : 'text-neo-error'
                        )}>
                            ${data.totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="text-2xl font-bold max-w-xs">
                            {data.totalPnL >= 0 ? "You're literally in the top 10% of traders. Congrats!" : "Hey, at least you're providing liquidity for the winners."}
                        </p>
                    </div>
                );
            case 2: // Biggest Win
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                        <h1 className="text-4xl font-black uppercase text-neo-success">Biggest Win</h1>
                        <div className="text-6xl font-black p-6 bg-white border-4 border-black brutal-shadow rotate-1">
                            +${data.biggestWin?.amount.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0'}
                        </div>
                        <div className="flex items-center gap-4">
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
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                        <h1 className="text-4xl font-black uppercase text-neo-error">Biggest Loss</h1>
                        <div className="text-6xl font-black p-6 bg-white border-4 border-black brutal-shadow -rotate-1">
                            ${data.biggestLoss?.amount.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0'}
                        </div>
                        <div className="flex items-center gap-4">
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
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                        <h1 className="text-4xl font-black uppercase">Degen Score</h1>
                        <div className="relative">
                            <div className="text-9xl font-black text-neo-accent brutal-shadow p-8 bg-white border-4 border-black">
                                {Math.round(data.degenScore)}
                            </div>
                            <div className="absolute -bottom-4 -right-4 text-4xl">🦍</div>
                        </div>
                        <p className="text-2xl font-bold max-w-xs">
                            {data.degenScore > 50 ? "Your sleep schedule is crying." : "At least you sleep."}
                        </p>
                    </div>
                );
            case 5: // Revenge Trading
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                        <h1 className="text-4xl font-black uppercase">Revenge Index</h1>
                        <div className="text-8xl font-black text-neo-error brutal-shadow p-6 bg-white border-4 border-black rotate-2">
                            {Math.round(data.revengeTradingScore)}%
                        </div>
                        <p className="text-2xl font-bold max-w-xs">
                            {data.revengeTradingScore > 20 ? "Therapy might be cheaper." : "Pretty chill, actually."}
                        </p>
                    </div>
                );
            case 6: // Fees
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                        <h1 className="text-4xl font-black uppercase">Fees Paid</h1>
                        <div className="text-7xl font-black text-neo-warning brutal-shadow p-6 bg-white border-4 border-black -rotate-1">
                            ${data.totalFees.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                        <p className="text-2xl font-bold">"You're basically a patron of the arts."</p>
                    </div>
                );
            case 7: // Cursed Coin
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                        <h1 className="text-4xl font-black uppercase">Cursed Coin</h1>
                        <div className="text-8xl font-black text-neo-error brutal-shadow p-6 bg-white border-4 border-black rotate-1">
                            {data.cursedCoin?.coin || 'None'}
                        </div>
                        <div className="text-3xl font-bold text-red-600">
                            ${data.cursedCoin?.pnl.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '0'}
                        </div>
                        <p className="text-2xl font-bold">"Maybe stop trading it?"</p>
                    </div>
                );
            case 8: // Worst Hour
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                        <h1 className="text-4xl font-black uppercase">Worst Hour</h1>
                        <div className="text-8xl font-black text-neo-main brutal-shadow p-6 bg-white border-4 border-black -rotate-2">
                            {data.worstHour ? `${data.worstHour.hour}:00` : 'N/A'}
                        </div>
                        <p className="text-2xl font-bold">"Maybe just... don't trade at this hour?"</p>
                    </div>
                );
            case 9: // Monthly Stats
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                        <h1 className="text-4xl font-black uppercase">Monthly Stats</h1>

                        <div className="space-y-6 w-full max-w-sm">
                            <div className="bg-white p-4 border-4 border-black brutal-shadow rotate-1">
                                <div className="text-sm font-bold uppercase text-gray-500 mb-1">Best Month</div>
                                <div className="text-3xl font-black text-neo-success">
                                    {data.bestMonth ? data.bestMonth.month : 'N/A'}
                                </div>
                                <div className="text-xl font-bold">
                                    +${data.bestMonth?.pnl.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '0'}
                                </div>
                            </div>

                            <div className="bg-white p-4 border-4 border-black brutal-shadow -rotate-1">
                                <div className="text-sm font-bold uppercase text-gray-500 mb-1">Worst Month</div>
                                <div className="text-3xl font-black text-neo-error">
                                    {data.worstMonth ? data.worstMonth.month : 'N/A'}
                                </div>
                                <div className="text-xl font-bold">
                                    ${data.worstMonth?.pnl.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '0'}
                                </div>
                            </div>
                        </div>
                        <p className="text-2xl font-bold">"Consistency is key... right?"</p>
                    </div>
                );
            case 10: // Personality
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
                        <h1 className="text-3xl font-black uppercase mb-4">You are...</h1>
                        <div className="text-9xl animate-bounce">{personality.emoji}</div>
                        <div className="text-5xl font-black bg-neo-accent text-white px-6 py-3 border-4 border-black brutal-shadow rotate-1">
                            {personality.name}
                        </div>
                        <p className="text-xl font-bold max-w-md bg-white p-4 border-2 border-black brutal-shadow-sm mt-4">
                            {personality.description}
                        </p>
                    </div>
                );
            case 11: // Summary
                return (
                    <div className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto space-y-6 animate-in fade-in zoom-in duration-500">
                        <h1 className="text-4xl font-black uppercase">Wrapped {new Date().getFullYear()}</h1>

                        {/* Capture Area */}
                        <div ref={summaryRef} className="grid grid-cols-2 gap-4 w-full bg-neo-bg p-4 rounded-lg">
                            <div className="bg-white p-4 border-2 border-black brutal-shadow">
                                <div className="text-xs font-bold uppercase text-gray-500">Trades</div>
                                <div className="text-2xl font-black">{data.totalTrades}</div>
                            </div>
                            <div className="bg-white p-4 border-2 border-black brutal-shadow">
                                <div className="text-xs font-bold uppercase text-gray-500">Win Rate</div>
                                <div className="text-2xl font-black">{Math.round(data.winRate)}%</div>
                            </div>
                            <div className="bg-white p-4 border-2 border-black brutal-shadow col-span-2">
                                <div className="text-xs font-bold uppercase text-gray-500">Total P&L</div>
                                <div className={cn("text-3xl font-black", data.totalPnL >= 0 ? 'text-neo-success' : 'text-neo-error')}>
                                    ${data.totalPnL.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </div>
                            </div>
                            <div className="bg-white p-4 border-2 border-black brutal-shadow col-span-2 flex items-center gap-4">
                                <div className="text-4xl">{personality.emoji}</div>
                                <div>
                                    <div className="text-xs font-bold uppercase text-gray-500">Personality</div>
                                    <div className="text-xl font-black">{personality.name}</div>
                                </div>
                            </div>
                            <div className="col-span-2 text-center text-xs font-bold opacity-50 mt-2">
                                Hyperliquid Trading Wrapped
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 w-full">
                            <button
                                onClick={handleShareOnX}
                                className="w-full py-3 bg-neo-accent text-white font-black text-lg border-4 border-black brutal-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                                SHARE ON X
                            </button>
                        </div>

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
        const types = ['trades', 'pnl', 'biggestWin', 'biggestLoss', 'degen', 'revenge', 'fees', 'cursed', 'worstHour', 'personality', 'summary'];
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
            <div ref={slideRef} className="w-full h-full bg-neo-bg">
                {renderSlideContent()}
            </div>
        </SlideLayout>
    );
};
