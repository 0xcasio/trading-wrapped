import React, { forwardRef } from 'react';
import { AnalyticsResult } from '@/lib/analytics';
import { Personality } from '@/lib/personalities'; // Assuming type is here or inferred
import { IconWrapper } from './IconWrapper';
import { Activity, Trophy, TrendingUp, TrendingDown, User, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareCardProps {
    data: AnalyticsResult;
    personality: { name: string; emoji: string; description: string };
}

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(({ data, personality }, ref) => {
    return (
        <div
            ref={ref}
            className="w-[1080px] h-[1920px] bg-neo-bg flex flex-col p-24 items-center justify-between font-sans text-black overflow-hidden relative"
            style={{ transform: 'scale(1)', transformOrigin: 'top left' }} // Reset any external scaling
        >
            {/* Header */}
            <div className="w-full text-center space-y-8">
                <h1 className="text-8xl font-black uppercase tracking-tighter drop-shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                    Trading
                    <br />
                    <span className="text-neo-main">Wrapped</span>
                </h1>
                <div className="text-4xl font-bold opacity-60 uppercase tracking-widest">
                    Hyperliquid Edition 2025
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="w-full grid grid-cols-2 gap-12 mt-12">
                {/* Personality */}
                <div className="col-span-2 bg-white border-8 border-black p-12 brutal-shadow rotate-1 transform mx-4">
                    <div className="flex items-center gap-8">
                        <div className="text-[10rem] leading-none animate-bounce-slow">
                            {personality.emoji}
                        </div>
                        <div className="text-left space-y-2">
                            <div className="text-3xl font-bold uppercase text-gray-500">You are a</div>
                            <div className="text-7xl font-black uppercase text-neo-accent leading-tight">
                                {personality.name}
                            </div>
                        </div>
                    </div>
                </div>

                {/* PnL and Trades */}
                <div className="bg-white border-8 border-black p-10 brutal-shadow -rotate-2">
                    <div className="flex items-center gap-4 mb-4">
                        <IconWrapper icon={data.totalPnL >= 0 ? TrendingUp : TrendingDown} size="lg" variant={data.totalPnL >= 0 ? 'success' : 'danger'} />
                        <span className="text-3xl font-bold uppercase text-gray-500">Total P&L</span>
                    </div>
                    <div className={cn("text-7xl font-black", data.totalPnL >= 0 ? 'text-neo-success' : 'text-neo-error')}>
                        {data.totalPnL >= 0 ? '+' : ''}${data.totalPnL.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                </div>

                <div className="bg-white border-8 border-black p-10 brutal-shadow rotate-2">
                    <div className="flex items-center gap-4 mb-4">
                        <IconWrapper icon={Activity} size="lg" variant="default" />
                        <span className="text-3xl font-bold uppercase text-gray-500">Trades</span>
                    </div>
                    <div className="text-7xl font-black">
                        {data.totalTrades}
                    </div>
                </div>

                {/* Win Rate */}
                <div className="bg-white border-8 border-black p-10 brutal-shadow rotate-1">
                    <div className="flex items-center gap-4 mb-4">
                        <IconWrapper icon={Trophy} size="lg" variant="warning" />
                        <span className="text-3xl font-bold uppercase text-gray-500">Win Rate</span>
                    </div>
                    <div className="text-7xl font-black">
                        {Math.round(data.winRate)}%
                    </div>
                </div>

                {/* Degen Score */}
                <div className="bg-white border-8 border-black p-10 brutal-shadow -rotate-1">
                    <div className="flex items-center gap-4 mb-4">
                        <IconWrapper icon={Zap} size="lg" variant="accent" />
                        <span className="text-3xl font-bold uppercase text-gray-500">Degen</span>
                    </div>
                    <div className="text-7xl font-black">
                        {Math.round(data.degenScore)}/100
                    </div>
                </div>
            </div>

            {/* What If Comparison */}
            <div className="w-full bg-black text-white border-8 border-white p-12 brutal-shadow mt-8 transform -rotate-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                <h3 className="text-4xl font-black uppercase mb-8 text-neutral-300">vs The Market</h3>

                <div className="space-y-6">
                    <div className="flex justify-between items-center text-5xl font-bold">
                        <span>You</span>
                        <span className={cn(data.totalPnL >= 0 ? 'text-neo-success' : 'text-neo-error')}>
                            {data.totalPnL >= 0 ? '+' : ''}${data.totalPnL.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                    </div>

                    {data.whatIf?.btc && (
                        <div className="flex justify-between items-center text-4xl font-bold opacity-80">
                            <span>If you held BTC</span>
                            <span className={cn(data.whatIf.btc.pnl >= 0 ? 'text-green-400' : 'text-red-400')}>
                                {data.whatIf.btc.pnl >= 0 ? '+' : ''}${data.whatIf.btc.pnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="w-full text-center mt-12 mb-8">
                <div className="inline-block bg-neo-main border-4 border-black px-8 py-4 brutal-shadow transform rotate-1">
                    <p className="text-3xl font-black text-neo-black uppercase">
                        Generate yours at tradingwrapped.xyz
                    </p>
                </div>
                <div className="mt-6 text-2xl font-bold opacity-50">
                    #HyperliquidWrapped
                </div>
            </div>

            {/* Background Decorations */}
            <div className="absolute top-20 left-10 w-32 h-32 bg-neo-success rounded-full border-4 border-black opacity-20 z-0 blur-xl"></div>
            <div className="absolute bottom-40 right-10 w-48 h-48 bg-neo-error rounded-full border-4 border-black opacity-20 z-0 blur-xl"></div>
        </div>
    );
});

ShareCard.displayName = 'ShareCard';
