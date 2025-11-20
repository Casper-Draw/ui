/**
 * Casper Lottery RNG Contract Service
 * Handles interactions with the deployed LotteryRng smart contract
 */

import {
  Args,
  CLTypeUInt8,
  CLValue,
  Hash,
  PublicKey,
  SessionBuilder,
  ContractCallBuilder,
  Transaction,
} from "casper-js-sdk";
import { config, csprToMotes } from "@/lib/config";

/**
 * Transaction status updates from CSPR.click
 */
export enum TransactionStatus {
  SENT = "SENT",
  PROCESSED = "PROCESSED",
  CANCELLED = "CANCELLED",
  TIMEOUT = "TIMEOUT",
  ERROR = "ERROR",
}

/**
 * Fetch the proxy WASM contract for making payable contract calls
 *
 * The proxy WASM is needed because casper-js-sdk v5's ContractCallBuilder
 * doesn't support sending attached value directly. The proxy WASM wraps
 * the call and handles the attached value transfer.
 *
 * @returns Proxy WASM bytes
 */
async function getProxyWASM(): Promise<Uint8Array> {
  const response = await fetch("/proxy_caller_lotto.wasm");
  if (!response.ok) {
    throw new Error(`Failed to fetch proxy WASM: ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

/**
 * Prepare enter_lottery transaction for the LotteryRng contract
 *
 * This creates a transaction that:
 * 1. Calls the enter_lottery() entry point via proxy WASM
 * 2. Sends the ticket price (50 CSPR) as attached value
 * 3. Returns a request_id for tracking randomness fulfillment
 *
 * Uses the WORKING pattern from lottery-demo-dapp and Odra proxy-caller:
 * - SessionBuilder with proxy WASM
 * - Runtime args expected by proxy: package_hash, entry_point, args, attached_value
 *
 * @param playerPublicKey - The player's Casper public key
 * @returns Transaction ready to be signed and sent via CSPR.click
 */
export async function prepareEnterLotteryTransaction(
  playerPublicKey: PublicKey
): Promise<Transaction> {
  try {
    // Convert ticket price to motes (1 CSPR = 1,000,000,000 motes)
    const ticketPriceInMotes = csprToMotes(config.ticketPriceCspr);
    const gasPriceInMotes = csprToMotes(config.gasPriceCspr);

    // Parse the package hash (remove 'hash-' prefix if present)
    const packageHashHex = config.lotteryRngPackageHash.replace("hash-", "");

    // Prepare empty arguments for enter_lottery (it takes no args)
    const args_bytes: Uint8Array = Args.fromMap({}).toBytes();
    const serialized_args = CLValue.newCLList(
      CLTypeUInt8,
      Array.from(args_bytes).map((v) => CLValue.newCLUint8(v))
    );

    // Build runtime arguments for proxy WASM - WITH amount field for 50K proxy
    // Using package_hash (not contract_package_hash) as expected by 50K proxy
    const pkgBytes = Hash.fromHex(packageHashHex).toBytes();
    const runtimeArgs = Args.fromMap({
      amount: CLValue.newCLUInt512(ticketPriceInMotes),
      attached_value: CLValue.newCLUInt512(ticketPriceInMotes),
      entry_point: CLValue.newCLString("enter_lottery"),
      package_hash: CLValue.newCLByteArray(pkgBytes),
      args: serialized_args,
    });

    // Fetch the proxy WASM
    const wasm = await getProxyWASM();

    console.log("🔧 Transaction params:", {
      ticketPriceInMotes,
      gasPriceInMotes,
      packageHash: packageHashHex,
      chainName: config.chainName,
      wasmSize: wasm.length,
    });

    // Build the transaction using SessionBuilder (Session WASM with proxy)
    const transaction = new SessionBuilder()
      .from(playerPublicKey)
      .runtimeArgs(runtimeArgs)
      .wasm(wasm)
      .payment(parseInt(gasPriceInMotes))
      .chainName(config.chainName)
      .build();

    console.log("✅ Transaction built successfully");
    console.log(
      "📦 Transaction JSON:",
      JSON.stringify(transaction.toJSON(), null, 2)
    );

    return transaction;
  } catch (error) {
    console.error("Error preparing enter_lottery transaction:", error);
    throw new Error(
      `Failed to prepare transaction: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Transaction result from blockchain
 */
export interface TransactionResult {
  deployHash: string;
  status: "success" | "error";
  errorMessage?: string;
}

/**
 * Handle transaction status updates from CSPR.click wallet
 *
 * @param status - Current transaction status
 * @param data - Transaction data (if available)
 * @returns Transaction result or null if still processing
 */
export function handleTransactionStatus(
  status: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
): TransactionResult | null {
  // Normalize status to uppercase for comparison
  const normalizedStatus = status.toUpperCase();

  switch (normalizedStatus) {
    case TransactionStatus.SENT:
      // Transaction sent to network, waiting for confirmation
      return null;

    case TransactionStatus.PROCESSED:
      // Transaction confirmed on blockchain
      if (data?.csprCloudTransaction) {
        const tx = data.csprCloudTransaction;
        // Get deploy hash from multiple possible locations
        const deployHash = tx.deploy_hash || tx.hash || data.transactionHash || data.deployHash;
        return {
          deployHash,
          status: tx.error_message ? "error" : "success",
          errorMessage: tx.error_message,
        };
      }
      return null;

    case TransactionStatus.CANCELLED:
      throw new Error("Transaction cancelled by user");

    case TransactionStatus.TIMEOUT:
      throw new Error("Transaction timed out");

    case TransactionStatus.ERROR:
      throw new Error(data?.message || "Transaction failed");

    default:
      return null;
  }
}

/**
 * Get CSPR.live explorer URL for a transaction
 */
export function getExplorerUrl(deployHash: string): string {
  return `${config.csprLiveUrl}/deploy/${deployHash}`;
}

/**
 * Helper to safely access window.csprclick
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCsprClick(): any {
  if (typeof window === "undefined") {
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).csprclick;
}

/**
 * Prepare settle_lottery transaction for the LotteryRng contract.
 *
 * @param playerPublicKey - The player's Casper public key
 * @param requestId - Request ID to settle (hex or decimal string)
 */
export async function prepareSettleLotteryTransaction(
  playerPublicKey: PublicKey,
  requestId: string
): Promise<Transaction> {
  try {
    const packageHashHex = config.lotteryRngPackageHash.replace("hash-", "");
    const gasPriceInMotes = csprToMotes(config.gasPriceCspr);

    const normalizedRequestId = (() => {
      const trimmed = requestId.trim();
      if (!trimmed) {
        throw new Error("Invalid request_id: empty");
      }
      if (trimmed.startsWith("0x") || trimmed.startsWith("0X")) {
        return BigInt(trimmed);
      }
      if (/^\d+$/.test(trimmed)) {
        return BigInt(trimmed);
      }
      return BigInt(`0x${trimmed}`);
    })();

    const runtimeArgs = Args.fromMap({
      request_id: CLValue.newCLUInt256(normalizedRequestId),
    });

    const transaction = new ContractCallBuilder()
      .from(playerPublicKey)
      .byPackageHash(packageHashHex)
      .entryPoint("settle_lottery")
      .runtimeArgs(runtimeArgs)
      .payment(parseInt(gasPriceInMotes, 10))
      .chainName(config.chainName)
      .build();

    return transaction;
  } catch (error) {
    console.error("Error preparing settle_lottery transaction:", error);
    throw new Error(
      `Failed to prepare settle transaction: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Prepare claim_refund transaction for the LotteryRng contract.
 *
 * Claims a refund for a pending play that hasn't been fulfilled within the
 * refund window (1 minute). Returns the full ticket price to the player.
 *
 * @param playerPublicKey - The player's Casper public key
 * @param requestId - Request ID to refund (hex or decimal string)
 */
export async function prepareClaimRefundTransaction(
  playerPublicKey: PublicKey,
  requestId: string
): Promise<Transaction> {
  try {
    const packageHashHex = config.lotteryRngPackageHash.replace("hash-", "");
    const gasPriceInMotes = csprToMotes(config.gasPriceCspr);

    const normalizedRequestId = (() => {
      const trimmed = requestId.trim();
      if (!trimmed) {
        throw new Error("Invalid request_id: empty");
      }
      if (trimmed.startsWith("0x") || trimmed.startsWith("0X")) {
        return BigInt(trimmed);
      }
      if (/^\d+$/.test(trimmed)) {
        return BigInt(trimmed);
      }
      return BigInt(`0x${trimmed}`);
    })();

    const runtimeArgs = Args.fromMap({
      request_id: CLValue.newCLUInt256(normalizedRequestId),
    });

    const transaction = new ContractCallBuilder()
      .from(playerPublicKey)
      .byPackageHash(packageHashHex)
      .entryPoint("claim_refund")
      .runtimeArgs(runtimeArgs)
      .payment(parseInt(gasPriceInMotes, 10))
      .chainName(config.chainName)
      .build();

    return transaction;
  } catch (error) {
    console.error("Error preparing claim_refund transaction:", error);
    throw new Error(
      `Failed to prepare refund transaction: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
