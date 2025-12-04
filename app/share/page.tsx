import { Metadata } from 'next';
import { decodeShareData } from '@/lib/share';
import { StoryContainer } from '@/components/StoryContainer';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

type Props = {
    searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const statsParam = searchParams.stats as string;

    if (!statsParam) {
        return {
            title: 'Trading Wrapped - Hyperliquid Edition',
            description: 'Check out my trading stats!',
        };
    }

    const data = decodeShareData(statsParam);
    if (!data) return {};

    const { stats, personality } = data;
    const title = `My Trading Wrapped: ${personality.emoji} ${personality.name}`;
    const description = `I made ${stats.totalTrades} trades with a ${Math.round(stats.winRate)}% win rate. PnL: $${Math.round(stats.totalPnL)}.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [`/api/og?stats=${statsParam}`],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [`/api/og?stats=${statsParam}`],
        },
    };
}

export default function SharePage({ searchParams }: Props) {
    const statsParam = searchParams.stats as string;
    const data = decodeShareData(statsParam);

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-neo-bg p-4 text-center">
                <h1 className="text-4xl font-black mb-4">Invalid Link</h1>
                <p className="mb-8">This share link seems to be broken.</p>
                <Link href="/">
                    <Button>Create Your Own</Button>
                </Link>
            </div>
        );
    }

    // We reuse the StoryContainer but maybe force it to the summary slide?
    // Or just render a static summary view.
    // For simplicity, let's render a static summary view similar to the slide.

    const { stats, personality } = data;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neo-bg p-4">
            <div className="w-full max-w-md space-y-6">
                <h1 className="text-4xl font-black uppercase text-center">Trading Wrapped</h1>

                <div className="grid grid-cols-2 gap-4 w-full bg-white p-4 border-4 border-black brutal-shadow">
                    <div className="col-span-2 text-center border-b-4 border-black pb-4 mb-2">
                        <div className="text-sm font-bold uppercase text-gray-500">Total P&L</div>
                        <div className={`text-5xl font-black ${stats.totalPnL >= 0 ? 'text-neo-success' : 'text-neo-error'}`}>
                            ${stats.totalPnL.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                    </div>

                    <div className="text-center p-2 border-2 border-black">
                        <div className="text-xs font-bold uppercase text-gray-500">Trades</div>
                        <div className="text-2xl font-black">{stats.totalTrades}</div>
                    </div>
                    <div className="text-center p-2 border-2 border-black">
                        <div className="text-xs font-bold uppercase text-gray-500">Win Rate</div>
                        <div className="text-2xl font-black">{Math.round(stats.winRate)}%</div>
                    </div>

                    <div className="col-span-2 flex items-center justify-center gap-4 p-4 bg-neo-bg border-2 border-black">
                        <div className="text-4xl">{personality.emoji}</div>
                        <div>
                            <div className="text-xs font-bold uppercase text-gray-500">Personality</div>
                            <div className="text-xl font-black">{personality.name}</div>
                        </div>
                    </div>
                </div>

                <Link href="/" className="block w-full">
                    <Button className="w-full py-4 text-xl">
                        CREATE YOUR OWN
                    </Button>
                </Link>
            </div>
        </div>
    );
}
