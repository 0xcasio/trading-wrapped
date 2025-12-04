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
        if (typeof window !== 'undefined') {
            return btoa(json);
        } else {
            return Buffer.from(json).toString('base64');
        }
    } catch (e) {
        console.error('Failed to encode share data', e);
        return '';
    }
}

export function decodeShareData(encoded: string): ShareData | null {
    try {
        let json;
        if (typeof window !== 'undefined') {
            json = atob(encoded);
        } else {
            json = Buffer.from(encoded, 'base64').toString('utf-8');
        }
        return JSON.parse(json);
    } catch (e) {
        console.error('Failed to decode share data', e);
        return null;
    }
}
