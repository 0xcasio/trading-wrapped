import { Metadata } from 'next';
import { decodeShareData, encodeShareData } from '@/lib/share';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { use } from 'react';
import { assignPersonality } from '@/lib/personalities';

export const dynamic = 'force-dynamic';

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const params = await searchParams;
    const statsParam = params.stats as string;

    if (!statsParam) {
        return {
            title: 'Trading Wrapped - Hyperliquid Edition',
            description: 'Check out my trading stats!',
        };
    }

    const data = decodeShareData(statsParam);
    if (!data || !data.stats) return {};

    const stats = data.stats;
    const personality = data.personality || assignPersonality(stats);

    const title = 'My Hyperliquid Trading Wrapped 🎁';
    const description = `${stats.totalTrades} trades • ${Math.round(stats.winRate)}% win rate • $${Math.round(stats.totalPnL)} P&L • ${personality.emoji} ${personality.name}`;

    // Re-encode stats for the image URL to keep it as short as possible
    // We exclude personality since the API can recalculate it
    const imageStats = {
        stats: data.stats,
        slideType: data.slideType,
        slideIndex: data.slideIndex
    };
    const imageParam = encodeShareData(imageStats);

    // IMPORTANT: Use absolute URL for OG image
    const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'https://trading-wrapped.vercel.app';
    const imageUrl = `${baseUrl}/api/og?stats=${imageParam}`;
    const shareUrl = `${baseUrl}/share?stats=${statsParam}`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: shareUrl,
            images: [imageUrl],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
        },
    };
}

export default function SharePage({ searchParams }: Props) {
    // In Next.js 16, searchParams is a Promise - unwrap it with use()
    const params = use(searchParams);
    const statsParam = params.stats as string;

    const data = decodeShareData(statsParam);

    if (!data || !data.stats) {
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

    const stats = data.stats;
    const personality = data.personality || assignPersonality(stats);

    // Re-encode for image URL to ensure it's minimal
    const imageStats = {
        stats: data.stats,
        slideType: data.slideType,
        slideIndex: data.slideIndex
    };
    // We can use encodeURIComponent(JSON.stringify(imageStats)) directly or import encodeShareData
    // Since encodeShareData is not imported in the component part (it is in the file though), let's use the helper
    const imageParam = encodeShareData(imageStats);

    const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : 'https://trading-wrapped.vercel.app';
    const imageUrl = `${baseUrl}/api/og?stats=${imageParam}`;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neo-bg p-4">
            <div className="w-full max-w-2xl space-y-6">
                <h1 className="text-4xl font-black uppercase text-center">My Hyperliquid Trading Wrapped 🎁</h1>

                {/* OG Image Preview */}
                <div className="w-full bg-white border-4 border-black brutal-shadow">
                    <img
                        src={imageUrl}
                        alt="Trading Wrapped Summary"
                        className="w-full h-auto"
                    />
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
