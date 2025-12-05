import { ImageResponse } from 'next/og';
import { decodeShareData } from '@/lib/share';
import { assignPersonality } from '@/lib/personalities';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const statsParam = searchParams.get('stats');

        if (!statsParam) {
            return new ImageResponse(
                (
                    <div
                        style={{
                            height: '100%',
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#E0E7FF',
                            fontSize: 60,
                            fontWeight: 900,
                        }}
                    >
                        Trading Wrapped
                    </div>
                ),
                {
                    width: 1200,
                    height: 630,
                }
            );
        }

        const data = decodeShareData(statsParam);

        if (!data) {
            return new Response('Invalid data', { status: 400 });
        }

        const { stats, slideType = 'summary' } = data;
        // Fallback for personality if missing
        const personality = data.personality || assignPersonality(stats);

        const pnlColor = stats.totalPnL >= 0 ? '#4ADE80' : '#EF4444';
        const pnlText = stats.totalPnL >= 0 ? `+$${stats.totalPnL.toLocaleString()}` : `$${stats.totalPnL.toLocaleString()}`;

        // Render different layouts based on slide type
        let content;

        switch (slideType) {
            case 'trades':
                content = (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
                        <div style={{ display: 'flex', fontSize: 50, fontWeight: 900, textTransform: 'uppercase' }}>Total Trades</div>
                        <div style={{ display: 'flex', fontSize: 180, fontWeight: 900, color: '#88AAEE', textShadow: '6px 6px 0px #000' }}>
                            {stats.totalTrades}
                        </div>
                        <div style={{ display: 'flex', fontSize: 32, fontWeight: 700 }}>
                            {stats.tradesPerDay > 50 ? "Do you even sleep?" : stats.tradesPerDay < 1 ? "Taking it easy, huh?" : "Not bad, not bad."}
                        </div>
                    </div>
                );
                break;

            case 'pnl':
                content = (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
                        <div style={{ display: 'flex', fontSize: 50, fontWeight: 900, textTransform: 'uppercase' }}>Total P&L</div>
                        <div style={{ display: 'flex', fontSize: 140, fontWeight: 900, color: pnlColor, textShadow: '6px 6px 0px #000' }}>
                            {pnlText}
                        </div>
                        <div style={{ display: 'flex', fontSize: 32, fontWeight: 700, textAlign: 'center', maxWidth: 800 }}>
                            {stats.totalPnL >= 0 ? "You're literally in the top 10% of traders. Congrats!" : "Hey, at least you're providing liquidity for the winners."}
                        </div>
                    </div>
                );
                break;

            case 'biggestWin':
                content = (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
                        <div style={{ display: 'flex', fontSize: 50, fontWeight: 900, textTransform: 'uppercase', color: '#4ADE80' }}>Biggest Win</div>
                        <div style={{ display: 'flex', fontSize: 140, fontWeight: 900, color: '#4ADE80', textShadow: '6px 6px 0px #000' }}>
                            +${stats.biggestWin?.amount.toLocaleString() || '0'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            <div style={{ display: 'flex', fontSize: 50, fontWeight: 900, backgroundColor: '#FACC15', padding: '20px 40px', border: '4px solid #000' }}>
                                {stats.biggestWin?.coin || 'N/A'}
                            </div>
                            <div style={{
                                display: 'flex',
                                fontSize: 40,
                                fontWeight: 900,
                                backgroundColor: stats.biggestWin?.side === 'A' ? '#4ADE80' : '#EF4444',
                                color: '#FFF',
                                padding: '20px 40px',
                                border: '4px solid #000'
                            }}>
                                {stats.biggestWin?.side === 'A' ? 'LONG' : 'SHORT'}
                            </div>
                        </div>
                        <div style={{ display: 'flex', fontSize: 32, fontWeight: 700 }}>"You probably screenshot this one."</div>
                    </div>
                );
                break;

            case 'biggestLoss':
                content = (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
                        <div style={{ display: 'flex', fontSize: 50, fontWeight: 900, textTransform: 'uppercase', color: '#EF4444' }}>Biggest Loss</div>
                        <div style={{ display: 'flex', fontSize: 140, fontWeight: 900, color: '#EF4444', textShadow: '6px 6px 0px #000' }}>
                            ${stats.biggestLoss?.amount.toLocaleString() || '0'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            <div style={{ display: 'flex', fontSize: 50, fontWeight: 900, backgroundColor: '#88AAEE', padding: '20px 40px', border: '4px solid #000' }}>
                                {stats.biggestLoss?.coin || 'N/A'}
                            </div>
                            <div style={{
                                display: 'flex',
                                fontSize: 40,
                                fontWeight: 900,
                                backgroundColor: stats.biggestLoss?.side === 'A' ? '#4ADE80' : '#EF4444',
                                color: '#FFF',
                                padding: '20px 40px',
                                border: '4px solid #000'
                            }}>
                                {stats.biggestLoss?.side === 'A' ? 'LONG' : 'SHORT'}
                            </div>
                        </div>
                        <div style={{ display: 'flex', fontSize: 32, fontWeight: 700 }}>"We don't talk about this one."</div>
                    </div>
                );
                break;

            case 'degen':
                content = (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
                        <div style={{ display: 'flex', fontSize: 50, fontWeight: 900, textTransform: 'uppercase' }}>Degen Score</div>
                        <div style={{ display: 'flex', fontSize: 200, fontWeight: 900, color: '#FF6B6B', textShadow: '6px 6px 0px #000', alignItems: 'center', gap: 20 }}>
                            {Math.round(stats.degenScore)}
                            <div style={{ display: 'flex', fontSize: 100 }}>🦍</div>
                        </div>
                        <div style={{ display: 'flex', fontSize: 32, fontWeight: 700 }}>
                            {stats.degenScore > 50 ? "Your sleep schedule is crying." : "At least you sleep."}
                        </div>
                    </div>
                );
                break;

            case 'revenge':
                content = (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
                        <div style={{ display: 'flex', fontSize: 50, fontWeight: 900, textTransform: 'uppercase' }}>Revenge Index</div>
                        <div style={{ display: 'flex', fontSize: 180, fontWeight: 900, color: '#EF4444', textShadow: '6px 6px 0px #000' }}>
                            {Math.round(stats.revengeTradingScore)}%
                        </div>
                        <div style={{ display: 'flex', fontSize: 32, fontWeight: 700 }}>
                            {stats.revengeTradingScore > 20 ? "Therapy might be cheaper." : "Pretty chill, actually."}
                        </div>
                    </div>
                );
                break;

            case 'fees':
                content = (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
                        <div style={{ display: 'flex', fontSize: 50, fontWeight: 900, textTransform: 'uppercase' }}>Fees Paid</div>
                        <div style={{ display: 'flex', fontSize: 140, fontWeight: 900, color: '#FACC15', textShadow: '6px 6px 0px #000' }}>
                            ${stats.totalFees.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                        <div style={{ display: 'flex', fontSize: 32, fontWeight: 700 }}>"You're basically a patron of the arts."</div>
                    </div>
                );
                break;

            case 'cursed':
                content = (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
                        <div style={{ display: 'flex', fontSize: 50, fontWeight: 900, textTransform: 'uppercase' }}>Cursed Coin</div>
                        <div style={{ display: 'flex', fontSize: 140, fontWeight: 900, color: '#EF4444', textShadow: '6px 6px 0px #000' }}>
                            {stats.cursedCoin?.coin || 'None'}
                        </div>
                        <div style={{ display: 'flex', fontSize: 50, fontWeight: 900, color: '#EF4444' }}>
                            ${stats.cursedCoin?.pnl.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '0'}
                        </div>
                        <div style={{ display: 'flex', fontSize: 32, fontWeight: 700 }}>"Maybe stop trading it?"</div>
                    </div>
                );
                break;

            case 'worstHour':
                content = (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
                        <div style={{ display: 'flex', fontSize: 50, fontWeight: 900, textTransform: 'uppercase' }}>Worst Hour</div>
                        <div style={{ display: 'flex', fontSize: 180, fontWeight: 900, color: '#88AAEE', textShadow: '6px 6px 0px #000' }}>
                            {stats.worstHour ? `${stats.worstHour.hour}:00` : 'N/A'}
                        </div>
                        <div style={{ display: 'flex', fontSize: 32, fontWeight: 700 }}>"Maybe just... don't trade at this hour?"</div>
                    </div>
                );
                break;

            case 'personality':
                content = (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
                        <div style={{ display: 'flex', fontSize: 50, fontWeight: 900, textTransform: 'uppercase' }}>You are...</div>
                        <div style={{ display: 'flex', fontSize: 200 }}>{personality.emoji}</div>
                        <div style={{ display: 'flex', fontSize: 60, fontWeight: 900, backgroundColor: '#FF6B6B', color: '#FFF', padding: '20px 40px', border: '6px solid #000' }}>
                            {personality.name}
                        </div>
                        <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, textAlign: 'center', maxWidth: 900, backgroundColor: '#FFF', padding: '30px', border: '4px solid #000' }}>
                            {personality.description}
                        </div>
                    </div>
                );
                break;

            default: // summary
                content = (
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                            <div style={{ display: 'flex', fontSize: 40, fontWeight: 900, textTransform: 'uppercase', color: '#666' }}>
                                Hyperliquid Trading Wrapped
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ display: 'flex', fontSize: 30, fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>Total P&L</div>
                            <div style={{ display: 'flex', fontSize: 120, fontWeight: 900, color: pnlColor, textShadow: '4px 4px 0px #000' }}>
                                {pnlText}
                            </div>
                        </div>

                        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-around', marginTop: 40 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ display: 'flex', fontSize: 24, fontWeight: 700, color: '#666' }}>TRADES</div>
                                <div style={{ display: 'flex', fontSize: 60, fontWeight: 900 }}>{stats.totalTrades}</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ display: 'flex', fontSize: 24, fontWeight: 700, color: '#666' }}>WIN RATE</div>
                                <div style={{ display: 'flex', fontSize: 60, fontWeight: 900 }}>{Math.round(stats.winRate)}%</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ display: 'flex', fontSize: 24, fontWeight: 700, color: '#666' }}>PERSONALITY</div>
                                <div style={{ display: 'flex', fontSize: 60, alignItems: 'center', gap: 10 }}>
                                    <div style={{ display: 'flex' }}>{personality.emoji}</div>
                                    <div style={{ display: 'flex', fontWeight: 900 }}>{personality.name}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#E0E7FF',
                        padding: '40px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: slideType === 'summary' ? 'space-between' : 'center',
                            width: '100%',
                            height: '100%',
                            backgroundColor: '#FFFFFF',
                            border: '8px solid #000000',
                            boxShadow: '16px 16px 0px 0px #000000',
                            padding: '60px',
                        }}
                    >
                        {content}
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (e: any) {
        console.log(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
