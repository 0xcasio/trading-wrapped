'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { fetchUserFills, fetchUserLedger } from '@/lib/api';
import { fetchHistoricalPrices, fetchSpyPrices } from '@/lib/historical';
import { analyzeTrades, AnalyticsResult } from '@/lib/analytics';
import { StoryContainer } from '@/components/StoryContainer';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<AnalyticsResult | null>(null);

  const handleAnalyze = async () => {
    if (!address.startsWith('0x') || address.length !== 42) {
      setError('Please enter a valid Ethereum address (0x...)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [trades, ledger, btcPrices, ethPrices, solPrices, spyPrices] = await Promise.all([
        fetchUserFills(address),
        fetchUserLedger(address),
        fetchHistoricalPrices('bitcoin', 365),
        fetchHistoricalPrices('ethereum', 365),
        fetchHistoricalPrices('solana', 365),
        fetchSpyPrices(365)
      ]);

      if (trades.length === 0) {
        setError('No trades found for this address on Hyperliquid.');
        setLoading(false);
        return;
      }

      const analytics = analyzeTrades(trades, ledger, {
        btc: btcPrices,
        eth: ethPrices,
        sol: solPrices,
        spy: spyPrices
      });
      setData(analytics);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (data) {
    return <StoryContainer data={data} onRestart={() => { setData(null); setAddress(''); }} />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-neo-bg">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-black uppercase text-neo-black drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            Trading Wrapped
          </h1>
          <p className="text-xl font-bold text-neo-black/80">
            Hyperliquid Edition
          </p>
        </div>

        <div className="brutal-card p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-lg font-bold uppercase">Wallet Address</label>
            <Input
              placeholder="0x..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAnalyze();
                } else if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
                  // Ensure Cmd+A / Ctrl+A always selects all text
                  e.currentTarget.select();
                }
              }}
            />
            {error && (
              <p className="text-neo-error font-bold text-sm animate-pulse">
                {error}
              </p>
            )}
          </div>

          <Button
            className="w-full text-xl py-4"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" /> Analyzing...
              </span>
            ) : (
              'ROAST MY TRADES'
            )}
          </Button>
        </div>

        <div className="text-center text-sm font-bold opacity-50">
          Built by <a href="https://twitter.com/0xCasio" target="_blank" rel="noopener noreferrer">0xCasio</a>
        </div>
      </div>
    </main>
  );
}
