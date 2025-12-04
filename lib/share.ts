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
        // console.log('Encoding data:', data);
        // console.log('JSON length:', json.length);

        if (typeof window !== 'undefined') {
            // Use TextEncoder to handle Unicode characters (emojis, etc.)
            const bytes = new TextEncoder().encode(json);
            const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join('');
            // console.log('Encoded length:', btoa(binString).length);
            return btoa(binString);
        } else {
            return Buffer.from(json).toString('base64');
        }
    } catch (e) {
        console.error('Failed to encode share data', e);
        console.error('Data that failed:', data);
        return '';
    }
}

export function decodeShareData(encoded: string): ShareData | null {
    try {
        let json;
        if (typeof window !== 'undefined') {
            // Decode the base64 and convert back to UTF-8
            const binString = atob(encoded);
            const bytes = Uint8Array.from(binString, (char) => char.codePointAt(0)!);
            json = new TextDecoder().decode(bytes);
        } else {
            json = Buffer.from(encoded, 'base64').toString('utf-8');
        }
        return JSON.parse(json);
    } catch (e) {
        console.error('Failed to decode share data', e);
        return null;
    }
}
