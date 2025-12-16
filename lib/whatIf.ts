import { LedgerUpdate } from './api';
import { PriceData } from './historical';

export interface WhatIfResult {
    totalValue: number; // Current value of the portfolio
    investedAmount: number; // Total amount deposited/invested
    pnl: number;
    pnlPercent: number;
    history: { date: string; value: number }[]; // Daily value history
}

export interface WhatIfScenarios {
    btc: WhatIfResult;
    eth: WhatIfResult;
    spy: WhatIfResult;
    savings: WhatIfResult;
}

// Default APY for savings account scenario (5%)
const SAVINGS_APY = 0.05;

function getPriceForDate(prices: PriceData, dateStr: string): number | null {
    // Exact match
    if (prices[dateStr]) return prices[dateStr];

    // Fallback? Ideally we have data. If not, maybe use latest available previous data?
    // For now, let's assume valid data or return null to signal missing data.
    return null;
}

function normalizeDate(timestamp: number): string {
    return new Date(timestamp).toISOString().split('T')[0];
}

export function calculateWhatIf(ledger: LedgerUpdate[], prices: PriceData, assetType: 'crypto' | 'stock'): WhatIfResult {
    const sortedLedger = [...ledger].sort((a, b) => a.time - b.time);

    let holdings = 0;
    let investedAmount = 0;
    const history: { date: string; value: number }[] = [];

    if (sortedLedger.length === 0) {
        return { totalValue: 0, investedAmount: 0, pnl: 0, pnlPercent: 0, history: [] };
    }

    const startDate = sortedLedger[0].time;
    const endDate = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    let currentTimestamp = startDate;
    let ledgerIndex = 0;

    // Helper to get price, filling forward if missing (simple version)
    // In a real app, we'd process the PriceData into a continuous map first.
    // For now, simple lookback inside the loop.

    while (currentTimestamp <= endDate) {
        const dateStr = normalizeDate(currentTimestamp);
        let currentPrice = getPriceForDate(prices, dateStr);

        // Fill forward price if missing today
        if (!currentPrice && history.length > 0) {
            // Estimate value using yesterday's value / yesterday's holdings? 
            // Calculated price = value / holdings.
            // Simpler: use the last applied price? 
            // We don't store lastPrice. Let's just use 0 or skip? 
            // If we skip, value drops to 0. Bad.
            // Let's search back 7 days for a price.
            for (let i = 1; i <= 7; i++) {
                const prevDate = normalizeDate(currentTimestamp - (i * dayMs));
                const prevPrice = getPriceForDate(prices, prevDate);
                if (prevPrice) {
                    currentPrice = prevPrice;
                    break;
                }
            }
        }

        // Process Ledger
        while (ledgerIndex < sortedLedger.length) {
            const entry = sortedLedger[ledgerIndex];
            const entryDateStr = normalizeDate(entry.time);

            if (entryDateStr === dateStr) {
                // Defensive check
                if (entry.delta && typeof entry.delta.usdc === 'string') {
                    const amount = parseFloat(entry.delta.usdc);
                    if (!isNaN(amount) && amount !== 0) {
                        const executionPrice = currentPrice || 1; // Fallback to 1 to avoid div/0 if NO price data ever (unlikely)

                        // Filter logic: Only count "funding" type events?
                        // deposits, withdrawals, subAccountTransfer?
                        // Ignore 'spot', 'internalTransfer' if they don't affect net USD into the account?
                        // Usually we only care about money IN/OUT of the main context.
                        // Let's accept all that have a USDC delta for now, assuming api fetches 'userNonFundingLedgerUpdates' correctly.

                        // If purchase (Deposit positive)
                        if (amount > 0) {
                            if (currentPrice) {
                                holdings += amount / currentPrice;
                            }
                            investedAmount += amount;
                        }
                        // If withdrawal (Deposit negative)
                        else if (amount < 0) {
                            if (currentPrice) {
                                holdings += amount / currentPrice; // adding negative amount reduces holdings
                            }
                            investedAmount += amount;
                        }
                    }
                }
                ledgerIndex++;
            } else if (entry.time < currentTimestamp) {
                ledgerIndex++;
            } else {
                break;
            }
        }

        const dailyValue = holdings * (currentPrice || 0);
        history.push({ date: dateStr, value: dailyValue });
        currentTimestamp += dayMs;
    }

    const finalValue = history.length > 0 ? history[history.length - 1].value : 0;
    // Net Invested can be negative if user withdrew profits.
    // PnL = Current Value - Net Invested.
    // Example: Dep 100, Value 200, With 200. Net Invested -100. Holdings 0. PnL = 0 - (-100) = +100. Correct.

    return {
        totalValue: finalValue,
        investedAmount, // Net Deposits
        pnl: finalValue - investedAmount,
        pnlPercent: investedAmount > 0 ? ((finalValue - investedAmount) / investedAmount) * 100 : 0,
        history
    };
}

export function calculateSavings(ledger: LedgerUpdate[], apy: number = SAVINGS_APY): WhatIfResult {
    const sortedLedger = [...ledger].sort((a, b) => a.time - b.time);
    if (sortedLedger.length === 0) {
        return { totalValue: 0, investedAmount: 0, pnl: 0, pnlPercent: 0, history: [] };
    }

    let balance = 0;
    let investedAmount = 0;
    const history: { date: string; value: number }[] = [];

    const startDate = sortedLedger[0].time;
    const endDate = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const dailyRate = apy / 365;

    let currentTimestamp = startDate;
    let ledgerIndex = 0;

    while (currentTimestamp <= endDate) {
        const dateStr = normalizeDate(currentTimestamp);

        // Apply Interest
        balance += balance * dailyRate;

        // Process Ledger
        while (ledgerIndex < sortedLedger.length) {
            const entry = sortedLedger[ledgerIndex];
            const entryDateStr = normalizeDate(entry.time);

            if (entryDateStr === dateStr) {
                if (entry.delta && typeof entry.delta.usdc === 'string') {
                    const amount = parseFloat(entry.delta.usdc);
                    if (!isNaN(amount)) {
                        balance += amount;
                        investedAmount += amount;
                    }
                }
                ledgerIndex++;
            } else if (entry.time < currentTimestamp) {
                ledgerIndex++;
            } else {
                break;
            }
        }

        history.push({ date: dateStr, value: balance });
        currentTimestamp += dayMs;
    }

    return {
        totalValue: balance,
        investedAmount,
        pnl: balance - investedAmount,
        pnlPercent: investedAmount !== 0 ? ((balance - investedAmount) / investedAmount) * 100 : 0,
        history
    };
}
