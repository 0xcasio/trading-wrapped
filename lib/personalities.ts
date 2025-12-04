import { AnalyticsResult } from './analytics';

export interface Personality {
    id: string;
    name: string;
    emoji: string;
    description: string;
}

export const PERSONALITIES: Record<string, Personality> = {
    BOT: {
        id: 'BOT',
        name: 'The Bot',
        emoji: '🤖',
        description: "Your trading frequency suggests you might actually be an algorithm. Are you human?",
    },
    NIGHT_OWL: {
        id: 'NIGHT_OWL',
        name: 'The Night Owl',
        emoji: '🦉',
        description: "3AM is your prime trading hour. Who needs sleep when there's volatility?",
    },
    REVENGE_TRADER: {
        id: 'REVENGE_TRADER',
        name: 'The Revenge Trader',
        emoji: '😡',
        description: "Lost $100? Time to 10x the position size! That'll show the market who's boss.",
    },
    GAMBLER: {
        id: 'GAMBLER',
        name: 'The Gambler',
        emoji: '🎲',
        description: "You win 9 times and lose it all on the 10th. The house always wins, but you keep playing.",
    },
    JP_MORGAN: {
        id: 'JP_MORGAN',
        name: 'J.P. Morgan',
        emoji: '🏦',
        description: "Calculated. Patient. Your positions are so big they probably move markets.",
    },
    DEGEN: {
        id: 'DEGEN',
        name: 'The Degen',
        emoji: '🦍',
        description: "You live for the volatility. Sleep is for the weak, and leverage is your love language.",
    },
    TOP_BUYER: {
        id: 'TOP_BUYER',
        name: 'The Top Buyer',
        emoji: '🤡',
        description: "You have a supernatural gift for buying the exact top. Every. Single. Time.",
    },
    BOOMER: {
        id: 'BOOMER',
        name: 'The Boomer',
        emoji: '👴',
        description: "Slow and steady... maybe too steady. You trade like you're still using dial-up internet.",
    },
    DIAMOND_HANDS: {
        id: 'DIAMOND_HANDS',
        name: 'Diamond Hands',
        emoji: '💎',
        description: "HODL until death. You've watched positions go -90% and said 'this is fine.'",
    },
    PAPER_HANDS: {
        id: 'PAPER_HANDS',
        name: 'Paper Hands',
        emoji: '🧻',
        description: "Any red candle sends you running. Your average hold time is shorter than a TikTok.",
    },
};

export function assignPersonality(stats: AnalyticsResult): Personality {
    if (stats.totalTrades === 0) return PERSONALITIES.PAPER_HANDS;

    // 1. The Bot (>50 trades/day)
    if (stats.tradesPerDay > 50) return PERSONALITIES.BOT;

    // 2. The Night Owl (>40% late night)
    if (stats.lateNightTradePercent > 40) return PERSONALITIES.NIGHT_OWL;

    // 3. The Revenge Trader (>30% revenge score)
    if (stats.revengeTradingScore > 30) return PERSONALITIES.REVENGE_TRADER;

    // 4. The Gambler (win rate > 60% BUT total P&L negative)
    if (stats.winRate > 60 && stats.totalPnL < 0) return PERSONALITIES.GAMBLER;

    // 5. J.P. Morgan (Avg position size > $50,000)
    if (stats.averagePositionSize > 50000) return PERSONALITIES.JP_MORGAN;

    // 6. The Degen (High frequency > 20/day + Late night > 20%)
    if (stats.tradesPerDay > 20 && stats.lateNightTradePercent > 20) return PERSONALITIES.DEGEN;

    // 7. The Top Buyer (Win rate < 40%)
    if (stats.winRate < 40 && stats.totalTrades > 0) return PERSONALITIES.TOP_BUYER;

    // 8. The Boomer (< 2 trades/day)
    if (stats.tradesPerDay < 2) return PERSONALITIES.BOOMER;

    // 9. Diamond Hands (Profitable AND win rate > 50%)
    if (stats.totalPnL > 0 && stats.winRate > 50) return PERSONALITIES.DIAMOND_HANDS;

    // 10. Paper Hands (Default)
    return PERSONALITIES.PAPER_HANDS;
}
