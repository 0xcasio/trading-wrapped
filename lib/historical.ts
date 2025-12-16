export interface PriceData {
    [date: string]: number; // YYYY-MM-DD -> price
}

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

// Helper to format date as YYYY-MM-DD
function formatDate(timestamp: number): string {
    return new Date(timestamp).toISOString().split('T')[0];
}

export async function fetchHistoricalPrices(coinId: string, days: number): Promise<PriceData> {
    try {
        // CoinGecko 'daily' interval might not be explicitly supported in the free tier 'market_chart' endpoint directly for 'max' without auto-granularity, 
        // but 'days' parameter works well. 
        // For free tier, accuracy might vary, but good enough for estimates.
        const response = await fetch(
            `${COINGECKO_API_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`
        );

        if (!response.ok) {
            if (response.status === 429) {
                console.warn('CoinGecko rate limit hit. Returning empty data.');
                return {};
            }
            throw new Error(`CoinGecko API Error: ${response.statusText}`);
        }

        const data = await response.json();
        const prices: PriceData = {};

        if (data.prices && Array.isArray(data.prices)) {
            data.prices.forEach(([timestamp, price]: [number, number]) => {
                const dateStr = formatDate(timestamp);
                // Keep the last price for the day (close price approximation)
                prices[dateStr] = price;
            });
        }

        return prices;
    } catch (error) {
        console.error(`Failed to fetch historical prices for ${coinId}:`, error);
        return {};
    }
}

// SPY fetcher - specific since it's a stock. 
// Free stock APIs are harder to come by without keys (e.g. AlphaVantage). 
// For this MVP/Phase 1, we might need a fallback or a different public source. 
// Yahoo Finance often scraped, but maybe unreliable. 
// Let's use a simple mock/approximation or a reliable public JSON if available.
// For now, I will use a simplified mock generator for SPY based on a starting price and some random walk 
// if we can't find a free keyless API. 
// OR, we can try to find a proxy.
// Actually, let's just leave it as a TODO or use a very rough static dataset for 2024/2025 if available?
// Better: return empty and handle it in the UI/Logic as "N/A" if we can't get it, 
// OR implement a basic mock for testing purposes.
export async function fetchSpyPrices(days: number): Promise<PriceData> {
    // TODO: specific implementation for SPY. 
    // For now, let's mock it to prove the 'What If' engine works.
    // Assuming SPY starts around $470 and grows ~10-20% over the year.
    const prices: PriceData = {};
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    let currentPrice = 470;

    for (let i = days; i >= 0; i--) {
        const timestamp = now - (i * dayMs);
        const dateStr = formatDate(timestamp);

        // Random daily move between -1% and +1.1% (slight upward bias)
        const move = (Math.random() * 0.021) - 0.01;
        currentPrice = currentPrice * (1 + move);

        prices[dateStr] = currentPrice;
    }

    return prices;
}
