/**
 * Casper address utilities
 */

import { PublicKey } from 'casper-js-sdk';

/**
 * Convert a Casper public key to account hash
 *
 * Public key format: 02<hex> (algorithm prefix + key)
 * Account hash: blake2b hash of the public key bytes
 */
export function publicKeyToAccountHash(publicKey: string): string {
  try {
    const pubKey = PublicKey.fromHex(publicKey);
    const accountHash = pubKey.accountHash().toHex();

    return accountHash;
  } catch (error) {
    console.error('[Casper] Failed to convert public key to account hash:', error);
    throw error;
  }
}

/**
 * Get account hash from public key (cached version)
 */
const accountHashCache = new Map<string, string>();

export function getAccountHash(publicKey: string): string {
  if (accountHashCache.has(publicKey)) {
    return accountHashCache.get(publicKey)!;
  }

  const accountHash = publicKeyToAccountHash(publicKey);
  accountHashCache.set(publicKey, accountHash);
  return accountHash;
}
