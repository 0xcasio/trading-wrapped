import { Trade } from './api';

export interface AnalyticsResult {
    totalTrades: number;
    totalPnL: number;
    winRate: number;
    totalFees: number;
    biggestWin: { amount: number; coin: string; side: string } | null;
    biggestLoss: { amount: number; coin: string; side: string } | null;
    degenScore: number; // 0-100
    revengeTradingScore: number; // 0-100 (% of trades that are revenge trades)
    cursedCoin: { coin: string; pnl: number } | null;
    luckyCoin: { coin: string; pnl: number } | null;
    worstHour: { hour: number; pnl: number } | null;
    averageTradeDuration: number; // in milliseconds
    tradesPerDay: number;
    lateNightTradePercent: number;
    averagePositionSize: number;
}

const DEGEN_COINS = new Set([
    'PEPE', 'DOGE', 'WIF', 'BONK', 'SHIB', 'MEME', 'TRUMP', 'POPCAT', 'MOG', 'HarryPotterObamaSonic10Inu'
]);

export function analyzeTrades(trades: Trade[]): AnalyticsResult {
    if (trades.length === 0) {
        return {
            totalTrades: 0,
            totalPnL: 0,
            winRate: 0,
            totalFees: 0,
            biggestWin: null,
            biggestLoss: null,
            degenScore: 0,
            revengeTradingScore: 0,
            cursedCoin: null,
            luckyCoin: null,
            worstHour: null,
            averageTradeDuration: 0,
            tradesPerDay: 0,
            lateNightTradePercent: 0,
            averagePositionSize: 0,
        };
    }

    let totalPnL = 0;
    let wins = 0;
    let totalFees = 0;
    let biggestWin = { amount: -Infinity, coin: '', side: '' };
    let biggestLoss = { amount: Infinity, coin: '', side: '' };

    const coinPnL: Record<string, number> = {};
    const hourPnL: Record<number, number> = {};

    let lateNightTrades = 0;
    let degenCoinTrades = 0;
    let revengeTrades = 0;
    let totalVolume = 0;

    // Sort trades by time just in case
    const sortedTrades = [...trades].sort((a, b) => a.time - b.time);

    const firstTradeTime = sortedTrades[0].time;
    const lastTradeTime = sortedTrades[sortedTrades.length - 1].time;
    const tradingDays = Math.max(1, (lastTradeTime - firstTradeTime) / (1000 * 60 * 60 * 24));

    for (let i = 0; i < sortedTrades.length; i++) {
        const trade = sortedTrades[i];
        const pnl = parseFloat(trade.closedPnl);
        const fee = parseFloat(trade.fee);
        const size = parseFloat(trade.sz);
        const price = parseFloat(trade.px);

        totalVolume += size * price;

        totalPnL += pnl;
        totalFees += fee;

        if (pnl > 0) wins++;

        if (pnl > biggestWin.amount) {
            biggestWin = { amount: pnl, coin: trade.coin, side: trade.side };
        }

        if (pnl < biggestLoss.amount) {
            biggestLoss = { amount: pnl, coin: trade.coin, side: trade.side };
        }

        // Coin PnL
        coinPnL[trade.coin] = (coinPnL[trade.coin] || 0) + pnl;

        // Hour PnL (Local time is tricky on server, but we can use UTC or try to infer. 
        // Ideally we pass user timezone, but for now let's assume UTC or just use the date object)
        const date = new Date(trade.time);
        const hour = date.getHours();
        hourPnL[hour] = (hourPnL[hour] || 0) + pnl;

        // Late Night (00:00 - 05:00)
        if (hour >= 0 && hour < 5) {
            lateNightTrades++;
        }

        // Degen Coin
        if (DEGEN_COINS.has(trade.coin)) {
            degenCoinTrades++;
        }

        // Revenge Trading (within 5 mins of a loss)
        if (i > 0) {
            const prevTrade = sortedTrades[i - 1];
            const prevPnl = parseFloat(prevTrade.closedPnl);
            const timeDiff = trade.time - prevTrade.time;

            if (prevPnl < 0 && timeDiff < 5 * 60 * 1000) {
                revengeTrades++;
            }
        }
    }

    // Cursed & Lucky Coins
    let cursedCoin = null;
    let luckyCoin = null;
    let minCoinPnL = Infinity;
    let maxCoinPnL = -Infinity;

    for (const [coin, pnl] of Object.entries(coinPnL)) {
        if (pnl < minCoinPnL) {
            minCoinPnL = pnl;
            cursedCoin = { coin, pnl };
        }
        if (pnl > maxCoinPnL) {
            maxCoinPnL = pnl;
            luckyCoin = { coin, pnl };
        }
    }

    // Worst Hour
    let worstHour = null;
    let minHourPnL = Infinity;
    for (const [hour, pnl] of Object.entries(hourPnL)) {
        if (pnl < minHourPnL) {
            minHourPnL = pnl;
            worstHour = { hour: parseInt(hour), pnl };
        }
    }

    const lateNightPercent = (lateNightTrades / trades.length) * 100;
    const degenCoinPercent = (degenCoinTrades / trades.length) * 100;

    // Degen Score: Weighted average of Late Night % and Degen Coin %
    // If > 50% late night or > 50% degen coins, score is high.
    const degenScore = Math.min(100, (lateNightPercent * 0.6) + (degenCoinPercent * 0.4));

    const revengeScore = (revengeTrades / trades.length) * 100;

    return {
        totalTrades: trades.length,
        totalPnL,
        winRate: (wins / trades.length) * 100,
        totalFees,
        biggestWin: biggestWin.amount !== -Infinity ? biggestWin : null,
        biggestLoss: biggestLoss.amount !== Infinity ? biggestLoss : null,
        degenScore,
        revengeTradingScore: revengeScore,
        cursedCoin,
        luckyCoin,
        worstHour,
        averageTradeDuration: 0, // Not easily calculable from just fills without open/close pairing logic, skipping for now
        tradesPerDay: trades.length / tradingDays,
        lateNightTradePercent: lateNightPercent,
        averagePositionSize: totalVolume / trades.length,
    };
}
