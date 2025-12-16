import { Trade, LedgerUpdate } from './api';
import { calculateWhatIf, calculateSavings, WhatIfScenarios } from './whatIf';
import { PriceData } from './historical';

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
    bestMonth: { month: string; pnl: number } | null;
    worstMonth: { month: string; pnl: number } | null;
    averageTradeDuration: number; // in milliseconds
    tradesPerDay: number;
    lateNightTradePercent: number;
    averagePositionSize: number;
    totalDeposits: number; // Sum of all incoming transfers/deposits
    whatIf?: WhatIfScenarios;
    pnlHistory?: { date: string; value: number }[];
    firstDepositDate?: string | null;
}

const DEGEN_COINS = new Set([
    'PEPE', 'DOGE', 'WIF', 'BONK', 'SHIB', 'MEME', 'TRUMP', 'POPCAT', 'MOG', 'HarryPotterObamaSonic10Inu'
]);

export function analyzeTrades(
    trades: Trade[],
    ledger: LedgerUpdate[] = [],
    historicalPrices: { btc: PriceData; eth: PriceData; spy: PriceData } = { btc: {}, eth: {}, spy: {} }
): AnalyticsResult {
    // Calculate Total Deposits and First Deposit Date
    let firstDepositDetails = { time: Infinity, date: null as string | null };

    const totalDeposits = ledger.reduce((sum, entry) => {
        if (entry.delta && typeof entry.delta.usdc === 'string') {
            const amount = parseFloat(entry.delta.usdc);
            if (amount > 0) {
                // Robust time parsing: API usually returns time as number (ms), but handle string just in case.
                // Also handle potential alternative field names if API changes.
                let time = entry.time;
                // @ts-ignore - checking for potential timestamp field
                if (!time && entry.timestamp) time = entry.timestamp;

                const timeNum = typeof time === 'string' ? parseFloat(time) : time;

                if (timeNum && !isNaN(timeNum) && timeNum < firstDepositDetails.time) {
                    firstDepositDetails.time = timeNum;
                    try {
                        firstDepositDetails.date = new Date(timeNum).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                    } catch (e) {
                        console.error('Date parsing error', e);
                    }
                }
                return sum + amount;
            }
        }
        return sum;
    }, 0);

    const whatIf: WhatIfScenarios = { // ... existing code 
        btc: calculateWhatIf(ledger, historicalPrices.btc, 'crypto'),
        eth: calculateWhatIf(ledger, historicalPrices.eth, 'crypto'),
        spy: calculateWhatIf(ledger, historicalPrices.spy, 'stock'),
        savings: calculateSavings(ledger)
    };

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
            bestMonth: null,
            worstMonth: null,
            averageTradeDuration: 0,
            tradesPerDay: 0,
            lateNightTradePercent: 0,
            averagePositionSize: 0,
            totalDeposits: 0,
            whatIf
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

    // Monthly PnL
    const monthPnL: Record<string, number> = {};

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

        // Hour PnL
        const date = new Date(trade.time);
        const hour = date.getHours();
        hourPnL[hour] = (hourPnL[hour] || 0) + pnl;

        // Monthly PnL (Format: "YYYY-MM")
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthPnL[monthKey] = (monthPnL[monthKey] || 0) + pnl;

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

    // Best & Worst Month
    let bestMonth = null;
    let worstMonth = null;
    let minMonthPnL = Infinity;
    let maxMonthPnL = -Infinity;

    for (const [month, pnl] of Object.entries(monthPnL)) {
        if (pnl > maxMonthPnL) {
            maxMonthPnL = pnl;
            bestMonth = { month, pnl };
        }
        if (pnl < minMonthPnL) {
            minMonthPnL = pnl;
            worstMonth = { month, pnl };
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

    // Calculate daily cumulative PnL for the chart
    const dailyPnLMap: Record<string, number> = {};
    const startDate = new Date(firstTradeTime);
    const endDate = new Date(lastTradeTime);

    // Initialize all days with 0 (optional, or just partial)
    // Better: Iterate trades and accumulate.
    let runningPnL = 0;
    const pnlHistory: { date: string; value: number }[] = [];

    // We need a daily series. 
    // Simply accumulating trade PnL by time.
    for (const trade of sortedTrades) {
        runningPnL += parseFloat(trade.closedPnl);
        const dateStr = new Date(trade.time).toISOString().split('T')[0];
        // Keep updating the latest value for the day
        // If multiple trades in a day, the last one sets the day's close PnL (cumulative)
        // But we need a list of days.
    }

    // Re-approach: specific daily buckets
    // Create a map of Date -> Daily Change
    const dailyChange: Record<string, number> = {};
    for (const trade of sortedTrades) {
        const dateStr = new Date(trade.time).toISOString().split('T')[0];
        dailyChange[dateStr] = (dailyChange[dateStr] || 0) + parseFloat(trade.closedPnl);
    }

    // Now build cumulative history
    let cumPnL = 0;
    // We want a continuous line? Or just data points?
    // AreaChart looks best with continuous days.
    // Fill gaps?
    // Let's just output the days we have activity for now, area chart will interpolate or we can fill gaps.
    // But for a "Portfolio Value" look, we should probably fill gaps.

    // Sort dates
    const sortedDates = Object.keys(dailyChange).sort();
    if (sortedDates.length > 0) {
        const first = new Date(sortedDates[0]);
        const last = new Date(sortedDates[sortedDates.length - 1]);
        const dayMs = 86400000;

        for (let t = first.getTime(); t <= last.getTime(); t += dayMs) {
            const dateStr = new Date(t).toISOString().split('T')[0];
            if (dailyChange[dateStr]) {
                cumPnL += dailyChange[dateStr];
            }
            pnlHistory.push({ date: dateStr, value: cumPnL });
        }
    }

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
        bestMonth,
        worstMonth,
        averageTradeDuration: 0,
        tradesPerDay: trades.length / tradingDays,
        lateNightTradePercent: lateNightPercent,
        averagePositionSize: totalVolume / trades.length,
        totalDeposits,
        whatIf,
        pnlHistory,
        firstDepositDate: firstDepositDetails.date
    };
}
