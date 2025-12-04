import { AnalyticsResult } from './analytics';
import { Personality } from './personalities';

export interface ShareData {
    stats: AnalyticsResult;
    personality: Personality;
    slideIndex?: number;
    slideType?: 'trades' | 'pnl' | 'biggestWin' | 'biggestLoss' | 'degen' | 'revenge' | 'fees' | 'cursed' | 'worstHour' | 'personality' | 'summary';
}

export function encodeShareData(data: ShareData): string {
    try {
        const json = JSON.stringify(data);
        // Use encodeURIComponent which handles Unicode properly
        return encodeURIComponent(json);
    } catch (e) {
        console.error('Failed to encode share data', e);
        return '';
    }
}

export function decodeShareData(encoded: string): ShareData | null {
    try {
        // Try to parse directly first (in case it's already a JSON string)
        try {
            return JSON.parse(encoded);
        } catch {
            // If that fails, try decoding first
            const json = decodeURIComponent(encoded);
            return JSON.parse(json);
        }
    } catch (e) {
        console.error('Failed to decode share data', e);
        return null;
    }
}
