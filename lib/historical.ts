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
// SPY fetcher - specific since it's a stock.
export async function fetchSpyPrices(days: number): Promise<PriceData> {
    try {
        const response = await fetch('/api/prices/spy');
        if (!response.ok) {
            throw new Error(`Failed to fetch SPY prices: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch SPY prices:', error);
        // Fallback to empty if API fails, UI should handle missing data
        return {};
    }
}
