export interface Trade {
  closedPnl: string;
  coin: string;
  crossed: boolean;
  dir: string;
  hash: string;
  oid: number;
  px: string;
  side: string;
  startPosition: string;
  sz: string;
  time: number;
  fee: string;
  feeToken: string;
  tid: number;
}

const HYPERLIQUID_API_URL = 'https://api.hyperliquid.xyz/info';

export async function fetchUserFills(address: string): Promise<Trade[]> {
  try {
    const response = await fetch(HYPERLIQUID_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'userFills',
        user: address,
        aggregateByTime: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();

    // The API returns an array of trades.
    // If the user has no trades or invalid address, it might return empty array or error.
    if (!Array.isArray(data)) {
      console.warn('Unexpected API response format:', data);
      return [];
    }

    return data as Trade[];
  } catch (error) {
    console.error('Failed to fetch user fills:', error);
    throw error;
  }
}

export interface LedgerUpdate {
  time: number;
  hash: string;
  delta: {
    type: 'deposit' | 'withdraw' | 'transfer' | 'spot' | 'internalTransfer' | 'subAccountTransfer';
    usdc: string;
  };
}

export async function fetchUserLedger(address: string): Promise<LedgerUpdate[]> {
  try {
    const response = await fetch(HYPERLIQUID_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'userNonFundingLedgerUpdates',
        user: address,
        startTime: 0,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.warn('Unexpected API response format for ledger:', data);
      return [];
    }

    return data as LedgerUpdate[];
  } catch (error) {
    console.error('Failed to fetch user ledger:', error);
    return [];
  }
}
