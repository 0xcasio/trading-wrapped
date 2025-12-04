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
        // Decode the URI component
        const json = decodeURIComponent(encoded);
        return JSON.parse(json);
    } catch (e) {
        console.error('Failed to decode share data', e);
        return null;
    }
}
