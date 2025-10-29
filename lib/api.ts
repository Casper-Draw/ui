/**
 * API client for Casper Draw Backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
}

/**
 * Convert motes to CSPR (divide by 1e9)
 */
function motesToCspr(motes: string | number | bigint | null | undefined): number {
  if (motes === null || motes === undefined) {
    return 0;
  }

  try {
    if (typeof motes === 'bigint') {
      return Number(motes) / 1_000_000_000;
    }

    const numeric = typeof motes === 'number' ? motes : Number(motes);
    if (Number.isNaN(numeric)) {
      return 0;
    }
    return numeric / 1_000_000_000;
  } catch (error) {
    console.error('[API] Failed to convert motes to CSPR:', error);
    return 0;
  }
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
    if (play.is_jackpot) {
      status = 'won-jackpot';
      prizeAmount = play.jackpot_amount ? motesToCspr(play.jackpot_amount) : undefined;
    } else if (play.prize_amount && parseInt(play.prize_amount) > 0) {
      status = 'won-consolation';
      prizeAmount = motesToCspr(play.prize_amount);
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

    console.log('[API] Fetching plays:', { url, playerAddress });
    const response = await fetch(url);

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

/**
 * Fetch the current lottery state (jackpot, round info, etc.)
 */
export async function fetchCurrentJackpot(): Promise<number | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/lottery/current`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Failed to fetch current jackpot:', errorText);
      return null;
    }

    const data: LotteryCurrentState = await response.json();
    const rawJackpot = data?.stats?.current_jackpot ?? data?.round?.final_jackpot ?? 0;
    const jackpotCspr = motesToCspr(rawJackpot);
    return Number.isFinite(jackpotCspr) ? jackpotCspr : null;
  } catch (error) {
    console.error('[API] Error fetching current jackpot:', error);
    return null;
  }
}
