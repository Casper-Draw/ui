/**
 * API client for Casper Draw Backend
 */

import { motesToCsprNumber } from './decimal';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface BackendLotteryPlay {
  play_id: string;
  request_id: string;
  round_id: number;
  player: string;
  timestamp: string;
  status: 'pending' | 'settled';
  entry_deploy_hash: string;
  prize_amount?: string;
  is_jackpot?: boolean;
  jackpot_amount?: string;
  settled_at?: string;
  settle_deploy_hash?: string;
  created_at?: string;
  updated_at?: string;
  // Nested relation from randomness_requests join
  randomness_requests?: {
    request_deploy_hash?: string;
    fulfill_deploy_hash?: string;
  } | null;
}

export interface LotteryEntry {
  requestId: string;
  playId: string;
  roundId: number;
  entryDate: string;
  cost: number;
  status: "pending" | "won-jackpot" | "won-consolation" | "lost";
  prizeAmount?: number;
  settledDate?: string;
  entryDeployHash?: string;
  requestDeployHash?: string;
  fulfillDeployHash?: string;
  settleDeployHash?: string;
  refundDeployHash?: string;
  // UI state flags
  awaitingFulfillment?: boolean;
  isPlaceholder?: boolean;
}

export interface GlobalStats {
  totalDraws: number;
  totalPrizesCspr: number;
  totalWageredCspr: number;
  activePlayers: number;
  avgSettlementMs: number;
}

/**
 * Convert motes to CSPR (divide by 1e9)
 */
function motesToCspr(
  motes: string | number | bigint | null | undefined
): number {
  if (motes === null || motes === undefined) {
    return 0;
  }

  try {
    if (typeof motes === "bigint") {
      return motesToCsprNumber(motes.toString());
    }
    return motesToCsprNumber(motes);
  } catch (error) {
    console.error("[API] Failed to convert motes to CSPR:", error);
    return 0;
  }
}

function normalizePayoutMotes(play: BackendLotteryPlay): string | undefined {
  const toBigInt = (value: string | number | bigint | null | undefined): bigint | null => {
    if (value === null || value === undefined) {
      return null;
    }
    try {
      if (typeof value === 'bigint') {
        return value;
      }
      const parsed = typeof value === 'number' ? BigInt(value) : BigInt(value);
      return parsed;
    } catch (error) {
      console.warn('[API] Failed to parse payout motes:', value, error);
      return null;
    }
  };

  if (play.is_jackpot) {
    const jackpot = toBigInt(play.jackpot_amount);
    if (jackpot !== null && jackpot > 0n) {
      return jackpot.toString();
    }

    const prize = toBigInt(play.prize_amount);
    if (prize !== null && prize > 0n) {
      return prize.toString();
    }

    return undefined;
  }

  const consolation = toBigInt(play.prize_amount);
  return consolation !== null && consolation > 0n
    ? consolation.toString()
    : undefined;
}

/**
 * Convert backend play to frontend LotteryEntry
 */
export function backendPlayToEntry(play: BackendLotteryPlay, ticketCost: number = 50): LotteryEntry {
  let status: LotteryEntry['status'];
  let prizeAmount: number | undefined;

  if (play.status === 'pending') {
    status = 'pending';
  } else {
    // Settled
    const payoutMotes = normalizePayoutMotes(play);

    if (play.is_jackpot) {
      status = 'won-jackpot';
      prizeAmount = payoutMotes ? motesToCspr(payoutMotes) : undefined;
    } else if (payoutMotes) {
      status = 'won-consolation';
      prizeAmount = motesToCspr(payoutMotes);
    } else {
      status = 'lost';
    }
  }

  return {
    requestId: play.request_id,
    playId: play.play_id,
    roundId: play.round_id,
    entryDate: play.timestamp,
    cost: ticketCost,
    status,
    prizeAmount,
    settledDate: play.settled_at,
    entryDeployHash: play.entry_deploy_hash,
    settleDeployHash: play.settle_deploy_hash,
    requestDeployHash: (Array.isArray((play as any).randomness_requests)
      ? (play as any).randomness_requests?.[0]?.request_deploy_hash
      : (play as any).randomness_requests?.request_deploy_hash) as string | undefined,
    fulfillDeployHash: (Array.isArray((play as any).randomness_requests)
      ? (play as any).randomness_requests?.[0]?.fulfill_deploy_hash
      : (play as any).randomness_requests?.fulfill_deploy_hash) as string | undefined,
  };
}

/**
 * Fetch player plays from backend
 */
export async function fetchPlayerPlays(
  playerAddress: string,
  status?: 'pending' | 'settled'
): Promise<LotteryEntry[]> {
  try {
    let url = `${API_BASE_URL}/player/${playerAddress}/plays`;
    if (status) {
      url += `?status=${status}`;
    }

    const cacheBuster = `_=${Date.now()}`;
    url += url.includes('?') ? `&${cacheBuster}` : `?${cacheBuster}`;

    console.log('[API] Fetching plays:', { url, playerAddress });
    const response = await fetch(url, { cache: 'no-store' });

    console.log('[API] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Error response:', errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[API] Received data:', data);
    const plays: BackendLotteryPlay[] = data.plays || [];
    console.log('[API] Parsed plays count:', plays.length);

    return plays.map(play => backendPlayToEntry(play));
  } catch (error) {
    console.error('[API] Failed to fetch player plays:', error);
    return [];
  }
}

export async function fetchGlobalStats(): Promise<GlobalStats> {
  const response = await fetch(`${API_BASE_URL}/stats/global`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch global stats: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    totalDraws: data.total_plays ?? 0,
    totalPrizesCspr: motesToCsprNumber(data.total_prizes_paid ?? '0'),
    totalWageredCspr: motesToCsprNumber(data.total_wagered ?? '0'),
    activePlayers: data.active_players ?? 0,
    avgSettlementMs: data.avg_settlement_ms ?? 0,
  };
}

/**
 * Fetch play by deploy hash (polls backend until found)
 * Used to get real request_id after transaction
 */
export async function fetchPlayByDeployHash(
  deployHash: string,
  maxAttempts: number = 15,
  intervalMs: number = 2000
): Promise<BackendLotteryPlay | null> {
  console.log(`[API] Polling for play with deploy hash: ${deployHash}`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[API] Attempt ${attempt}/${maxAttempts} to fetch play...`);

      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/play/${deployHash}`);

      if (response.ok) {
        const play: BackendLotteryPlay = await response.json();
        console.log(`[API] Play found! request_id: ${play.request_id}`);
        return play;
      }

      if (response.status === 404) {
        // Not found yet, wait and retry
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, intervalMs));
          continue;
        }
      } else {
        // Other error
        console.error(`[API] Error response: ${response.status}`);
        return null;
      }
    } catch (error) {
      console.error(`[API] Request failed:`, error);
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
        continue;
      }
    }
  }

  console.error(`[API] Failed to fetch play after ${maxAttempts} attempts`);
  return null;
}

/**
 * Check if backend is healthy
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

export interface LotteryCurrentState {
  round?: {
    round_id: number;
    total_plays?: number;
    final_jackpot?: string | number | null;
  } | null;
  config?: Record<string, unknown> | null;
  stats?: {
    current_jackpot?: string | number | null;
  } | null;
}

export interface LotterySnapshot {
  jackpotCspr: number | null;
  roundId: number | null;
  totalPlays: number | null;
}

/**
 * Fetch the current lottery state (jackpot, round info, etc.)
 */
export async function fetchCurrentJackpot(): Promise<LotterySnapshot | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/lottery/current?_=${Date.now()}`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Failed to fetch current jackpot:', errorText);
      return null;
    }

    const data: LotteryCurrentState = await response.json();
    const rawJackpot = data?.stats?.current_jackpot ?? data?.round?.final_jackpot ?? 0;
    const jackpotCspr = motesToCspr(rawJackpot);
    const roundId =
      typeof data?.round?.round_id === 'number' ? data.round.round_id : null;
    const totalPlays =
      typeof data?.round?.total_plays === 'number' ? data.round.total_plays : null;

    return {
      jackpotCspr: Number.isFinite(jackpotCspr) ? jackpotCspr : null,
      roundId,
      totalPlays,
    };
  } catch (error) {
    console.error('[API] Error fetching current jackpot:', error);
    return null;
  }
}
