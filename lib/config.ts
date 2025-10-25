/**
 * Application configuration from environment variables
 */

export interface LotteryConfig {
  // Casper Network
  chainName: string;
  rpcUrl: string;

  // Contract Package Hashes
  lotteryRngPackageHash: string;
  coordinatorPackageHash: string;

  // Lottery Parameters
  ticketPriceCspr: number;
  lotteryFeeCspr: number;
  gasPriceCspr: number;

  // CSPR.click
  csprClickAppId: string;
  csprClickDigest?: string;

  // Explorer
  csprLiveUrl: string;
}

/**
 * Parse and validate configuration from environment variables
 */
function getConfig(): LotteryConfig {
  // Required environment variables
  const requiredVars = {
    chainName: process.env.NEXT_PUBLIC_CASPER_CHAIN_NAME,
    rpcUrl: process.env.NEXT_PUBLIC_CASPER_RPC_URL,
    lotteryRngPackageHash: process.env.NEXT_PUBLIC_LOTTERY_RNG_PACKAGE_HASH,
    coordinatorPackageHash: process.env.NEXT_PUBLIC_COORDINATOR_PACKAGE_HASH,
    ticketPriceCspr: process.env.NEXT_PUBLIC_TICKET_PRICE_CSPR,
    lotteryFeeCspr: process.env.NEXT_PUBLIC_LOTTERY_FEE_CSPR,
    gasPriceCspr: process.env.NEXT_PUBLIC_GAS_PRICE_CSPR,
    csprClickAppId: process.env.NEXT_PUBLIC_CSPRCLICK_APP_ID,
    csprLiveUrl: process.env.NEXT_PUBLIC_CSPR_LIVE_URL,
  };

  // Check for missing required variables
  const missing = Object.entries(requiredVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  return {
    chainName: requiredVars.chainName!,
    rpcUrl: requiredVars.rpcUrl!,
    lotteryRngPackageHash: requiredVars.lotteryRngPackageHash!,
    coordinatorPackageHash: requiredVars.coordinatorPackageHash!,
    ticketPriceCspr: parseFloat(requiredVars.ticketPriceCspr!),
    lotteryFeeCspr: parseFloat(requiredVars.lotteryFeeCspr!),
    gasPriceCspr: parseFloat(requiredVars.gasPriceCspr!),
    csprClickAppId: requiredVars.csprClickAppId!,
    csprClickDigest: process.env.NEXT_PUBLIC_CSPRCLICK_DIGEST,
    csprLiveUrl: requiredVars.csprLiveUrl!,
  };
}

/**
 * Global configuration object
 */
export const config = getConfig();

/**
 * Convert CSPR to motes (1 CSPR = 1,000,000,000 motes)
 */
export function csprToMotes(cspr: number): string {
  const MOTES_PER_CSPR = 1_000_000_000;
  return (cspr * MOTES_PER_CSPR).toString();
}

/**
 * Convert motes to CSPR
 */
export function motesToCspr(motes: string | number): number {
  const MOTES_PER_CSPR = 1_000_000_000;
  const motesNum = typeof motes === 'string' ? parseFloat(motes) : motes;
  return motesNum / MOTES_PER_CSPR;
}
