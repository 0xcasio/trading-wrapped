# Improvement Plan: Data Visualization, Deep Insights, & Virality

This plan aims to transform the Trading Wrapped app into a viral-ready, data-rich product suitable for a portfolio.

## User Review Required
> [!IMPORTANT]
> This plan involves installing new dependencies: `recharts` and `react-countup`.

> [!NOTE]
> We will need to fetch historical price data for BTC, ETH, and SPY (S&P 500) to calculate "What If" scenarios. We will use a public API (like CoinGecko or similar free tier) for this.

## Phased Approach

### Phase 1: Logic & Data Capabilities ("The Brain")
Focuses on acquiring the necessary data and implementing the core calculation logic for deep insights.
- **Goal:** Enable "What If" scenarios and precise P&L tracking.
- **Key Tasks:**
    1.  **Deposits & Withdrawals:** Implement fetching of `userNonFundingLedgerUpdates` from Hyperliquid API to get the exact timing and amount of user deposits.
    2.  **Historical Data:** Create a utility to fetch historical daily close prices for BTC, ETH, and SPY for the relevant year.
    3.  **"What If" Engine:** Implement logic to simulate:
        -   *Scenario A:* "If you bought BTC with every deposit immediately."
        -   *Scenario B:* "If you bought ETH..."
        -   *Scenario C:* "If you put it in a 5% APY Savings Account."
        -   *Scenario D:* "If you bought S&P 500."
    4.  **Analytics Update:** Update `analyzeTrades` to compute these comparative metrics and the user's actual cumulative P&L time series.

### Phase 2: Visual System & Brand ("The Look")
Focuses on removing the "AI wrapper" feel by establishing a unique, cohesive visual identity.
- **Goal:** Replace emojis with a custom, "brutal" icon set and implement rich charts.
- **Key Tasks:**
    1.  **Iconography:** Replace all emojis with `lucide-react` icons styled with the "brutal" theme (thick borders, hard shadows, specific aspect ratios). create a `IconWrapper` component for consistency.
    2.  **Charts:** Install `recharts`. Create `PnLChartSlide` (Area Chart) and `MonthlyChartSlide` (Bar Chart).
    3.  **Slide Redesign:** Update existing slides (`SlideLayout`, `StoryContainer`) to use the new icons and layout adjustments to accommodate more data density.

### Phase 3: Virality & Polish ("The Magic")
Focuses on the "Wow" factor and shareability.
- **Goal:** Make the experience fluid and highly shareable.
- **Key Tasks:**
    1.  **Viral Share Card:** Create a hidden, high-density HTML element designed specifically for `html-to-image` export. This card will summarize the user's year (Rank, P&L, "What If" comparison, Personality) in a vertical format suitable for TikTok/Reels/Stories.
    2.  **Animations:** Install `framer-motion` and `react-countup`. Replace standard CSS transitions with orchestrated motion (staggered list items, bouncing numbers, smooth chart reveals).
    3.  **Final Polish:** Add text fit/scaling logic for long names, ensure mobile responsiveness is perfect, and add a "confetti" or "stamp" effect for achievements.

## Detailed Implementation Specs

### Dependencies
#### [NEW] [package.json](file:///Users/casio/Documents/tradeWrapped/package.json)
- Add `recharts`
- Add `react-countup`

### Logic Layer
#### [MODIFY] [lib/api.ts](file:///Users/casio/Documents/tradeWrapped/lib/api.ts)
- Add `fetchUserLedger` function to call `info` endpoint with `userNonFundingLedgerUpdates`.

#### [MODIFY] [lib/analytics.ts](file:///Users/casio/Documents/tradeWrapped/lib/analytics.ts)
- Add logic to integrate ledger data.
- Implement `calculateBenchmarks(ledger, historicalPrices)` function.

### UI Components
#### [MODIFY] [components/StoryContainer.tsx](file:///Users/casio/Documents/tradeWrapped/components/StoryContainer.tsx)
- Integrate new slides and logic.
- Replace emojis with Icon components.

## Verification Plan

### Automated Tests
- Build verification.

### Manual Verification
1.  **"What If" Accuracy:** Check if the calculation makes sense (e.g., if BTC did +100% and I deposited $1000 at the start, do I see ~$2000 in the benchmark?).
2.  **Visuals:** Ensure no emojis remain. Verify icons look "brutal".
3.  **Flow:** Walk through the entire story from start to finish.
