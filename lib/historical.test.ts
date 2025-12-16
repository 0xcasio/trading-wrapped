import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchHistoricalPrices, fetchSpyPrices } from './historical';

// Mock global fetch
const globalFetch = global.fetch;

describe('Historical Data Fetcher', () => {
    beforeEach(() => {
        global.fetch = vi.fn();
    });

    afterEach(() => {
        global.fetch = globalFetch;
        vi.restoreAllMocks();
    });

    it('should fetch and format crypto prices correctly', async () => {
        const mockResponse = {
            prices: [
                [1704067200000, 42000], // 2024-01-01
                [1704153600000, 43000], // 2024-01-02
            ]
        };

        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        });

        const data = await fetchHistoricalPrices('bitcoin', 7);

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('api.coingecko.com/api/v3/coins/bitcoin')
        );

        // Check date formatting (local time might vary, using ISO split logic)
        // 1704067200000 is 2024-01-01T00:00:00.000Z
        // The implementation uses toISOString().split('T')[0] which is UTC date.
        expect(data['2024-01-01']).toBe(42000);
        expect(data['2024-01-02']).toBe(43000);
    });

    it('should handle API errors gracefully', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 500,
            statusText: 'Server Error'
        });

        const data = await fetchHistoricalPrices('bitcoin', 7);
        expect(data).toEqual({});
    });

    it('should generate mock SPY prices', async () => {
        const data = await fetchSpyPrices(10);
        const keys = Object.keys(data);
        expect(keys.length).toBeGreaterThan(0);
        expect(typeof data[keys[0]]).toBe('number');
    });
});
