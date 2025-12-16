import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

// In-memory cache
let cachedData: any = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function GET() {
    const now = Date.now();

    if (cachedData && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
        return NextResponse.json(cachedData);
    }

    try {
        // Handle CJS/ESM discrepancy if necessary, or just try instantiation if it's a class
        // Based on debug, default export is a class.
        // In ESM import, if yahooFinance is the class, we new it.
        // However, typescript types might complain if it expects an instance.
        // Let's try flexible approach or just cast it.
        const yf = new (yahooFinance as any)();

        // Use chart instead of historical
        const result = await yf.chart('SPY', {
            period1: '2023-01-01',
            interval: '1d'
        });

        // Result from chart is { meta, quotes, ... } or Array?
        // documentation says chart returns { meta, quotes } usually for v2
        // Let's inspect result structure in debug if needed, but standard is Object with quotes array.
        // Wait, yahoo-finance2 chart() often returns result directly as { meta, quotes } or just array if specialized.
        // Let's assume standard behavior: { quotes: [...] }

        const quotes = result.quotes || [];

        const formattedData: Record<string, number> = {};
        quotes.forEach((quote: any) => {
            if (quote.date && quote.close) {
                const date = new Date(quote.date);
                const dateStr = date.toISOString().split('T')[0];
                formattedData[dateStr] = quote.close;
            }
        });

        cachedData = formattedData;
        cacheTimestamp = now;

        return NextResponse.json(formattedData);
    } catch (error) {
        console.error('Failed to fetch SPY data:', error);
        return NextResponse.json({ error: 'Failed to fetch SPY data' }, { status: 500 });
    }
}
