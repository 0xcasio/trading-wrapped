import { analyzeTrades } from '../lib/analytics';
import { Trade, LedgerUpdate } from '../lib/api';
import { PriceData } from '../lib/historical';

// Mock Data
const mockTrades: Trade[] = [
    {
        closedPnl: '100',
        coin: 'ETH',
        crossed: false,
        dir: 'Open Long',
        hash: '0x1',
        oid: 1,
        px: '2000',
        side: 'B',
        startPosition: '0',
        sz: '1',
        time: Date.now() - 86400000 * 5, // 5 days ago
        fee: '1',
        feeToken: 'USDC',
        tid: 1,
    }
];

const mockLedger: LedgerUpdate[] = [
    {
        time: Date.now() - 86400000 * 10, // 10 days ago
        hash: '0x1',
        delta: { type: 'deposit', usdc: '5000' }
    }
];

const mockPriceData: PriceData = {};
// Fill 10 days of prices
const now = Date.now();
for (let i = 0; i <= 10; i++) {
    const t = now - (i * 86400000);
    const date = new Date(t).toISOString().split('T')[0];
    mockPriceData[date] = 100 + i; // Price increasing / decreasing logic doesn't matter much for visual check
}

const historicalPrices = {
    btc: mockPriceData,
    eth: mockPriceData,
    sol: mockPriceData,
    spy: mockPriceData
};

console.log("Running Phase 1 Verification...");

const result = analyzeTrades(mockTrades, mockLedger, historicalPrices);

console.log("\n--- General Stats ---");
console.log(`Total Trades: ${result.totalTrades}`);
console.log(`PnL: ${result.totalPnL}`);

console.log("\n--- What If Analysis ---");
if (result.whatIf) {
    console.log("BTC Scenario:");
    console.log(`  Invested: $${result.whatIf.btc.investedAmount}`);
    console.log(`  Current Value: $${result.whatIf.btc.totalValue.toFixed(2)}`);
    console.log(`  PnL: ${result.whatIf.btc.pnlPercent.toFixed(2)}%`);

    console.log("Savings Scenario:");
    console.log(`  Invested: $${result.whatIf.savings.investedAmount}`);
    console.log(`  Current Value: $${result.whatIf.savings.totalValue.toFixed(2)}`);
} else {
    console.error("❌ What If data missing!");
}

console.log("\nDone.");
