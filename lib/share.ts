import { AnalyticsResult } from './analytics';
import { Personality } from './personalities';

export interface ShareData {
    stats: AnalyticsResult;
    personality?: Personality;
    slideIndex?: number;
    slideType?: 'trades' | 'pnl' | 'biggestWin' | 'biggestLoss' | 'degen' | 'revenge' | 'fees' | 'cursed' | 'worstHour' | 'monthly' | 'personality' | 'summary';
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
        // Next.js automatically URL-decodes searchParams, so the 'encoded' string
        // is actually already a JSON string. Just parse it directly.
        const parsed = JSON.parse(encoded);
        return parsed;
    } catch (e) {
        // If direct parsing fails, try URL decoding first (for backwards compatibility)
        try {
            const decoded = decodeURIComponent(encoded);
            return JSON.parse(decoded);
        } catch (e2) {
            console.error('Failed to decode share data', e, e2);
            return null;
        }
    }
}
