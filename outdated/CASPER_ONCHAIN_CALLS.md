# How to Send On-Chain Calls on Casper Network

## Overview

This document explains how to properly send on-chain transactions to Casper Network contracts, specifically focusing on **payable contract calls** (contracts that require attached value).

---

## The Problem

### What Doesn't Work ❌

The following code appears intuitive but **DOES NOT WORK** with casper-js-sdk v5:

```typescript
import { SessionBuilder, Hash, PublicKey, Args } from 'casper-js-sdk';

// ❌ THIS WILL FAIL - These methods don't exist!
const transaction = new SessionBuilder()
  .from(playerPublicKey)
  .entryPoint('enter_lottery')      // ❌ METHOD DOES NOT EXIST
  .packageHash(Hash.fromHex(...))   // ❌ METHOD DOES NOT EXIST
  .amount(ticketPriceInMotes)       // ❌ METHOD DOES NOT EXIST
  .payment(gasPriceInMotes)
  .chainName(config.chainName)
  .build();
```

**Error:** `entryPoint is not a function`

### Why This Fails

Looking at the actual casper-js-sdk v5 source code (`node_modules/casper-js-sdk/dist/types/TransactionBuilder.d.ts`):

```typescript
export declare class SessionBuilder extends TransactionBuilder<SessionBuilder> {
    private _isInstallOrUpgrade;
    constructor();
    wasm(wasmBytes: Uint8Array): SessionBuilder;      // ✅ EXISTS
    installOrUpgrade(): SessionBuilder;               // ✅ EXISTS
    runtimeArgs(args: Args): SessionBuilder;          // ✅ EXISTS
    buildFor1_5(): Transaction;                       // ✅ EXISTS
}
```

**SessionBuilder ONLY has 3 methods:**
- `wasm()` - for deploying WASM contracts
- `installOrUpgrade()` - for install/upgrade operations
- `runtimeArgs()` - for passing arguments

**NO `.entryPoint()`, `.packageHash()`, or `.amount()` methods exist!**

---

## Two Approaches for Contract Calls

### Approach 1: Non-Payable Contracts (No Attached Value) ✅

For contracts that **don't** require attached value (e.g., Coordinator contract), use `ContractCallBuilder`:

```typescript
import { ContractCallBuilder, Args, CLValue, PublicKey } from 'casper-js-sdk';

const transaction = new ContractCallBuilder()
  .from(publicKey)
  .byPackageHash(packageHash)           // ✅ THIS EXISTS
  .entryPoint('commit')                 // ✅ THIS EXISTS
  .runtimeArgs(args)
  .payment(5_000_000_000)
  .chainName('casper-test')
  .build();
```

**Source:** `autonom_src/casper_commit.js` (working backend implementation)

**When to use:**
- Read operations
- Contract calls that don't need CSPR transfer
- Non-payable entry points

### Approach 2: Payable Contracts (With Attached Value) ✅

For ODRA contracts with `#[odra(payable)]` decorator that require attached value:

#### Step 1: Get Proxy WASM

You need a proxy WASM contract that wraps calls and handles value transfer:

```typescript
async function getProxyWASM(): Promise<Uint8Array> {
  const response = await fetch('/proxy_caller.wasm');
  if (!response.ok) {
    throw new Error(`Failed to fetch proxy WASM: ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}
```

#### Step 2: Build Transaction with SessionBuilder

```typescript
import {
  Args,
  CLTypeUInt8,
  CLValue,
  Hash,
  PublicKey,
  SessionBuilder,
  Transaction,
} from 'casper-js-sdk';

export async function prepareEnterLotteryTransaction(
  playerPublicKey: PublicKey
): Promise<Transaction> {
  const ticketPriceInMotes = '50000000000'; // 50 CSPR
  const gasPriceInMotes = '5000000000';     // 5 CSPR
  const packageHashHex = 'your-package-hash-without-hash-prefix';

  // Prepare empty arguments (if entry point takes no args)
  const args_bytes: Uint8Array = Args.fromMap({}).toBytes();

  const serialized_args = CLValue.newCLList(
    CLTypeUInt8,
    Array.from(args_bytes).map(value => CLValue.newCLUint8(value))
  );

  // Build runtime arguments for proxy WASM
  const runtimeArgs = Args.fromMap({
    contract_package_hash: CLValue.newCLByteArray(
      Hash.fromHex(packageHashHex).toBytes()
    ),
    entry_point: CLValue.newCLString('enter_lottery'),
    args: serialized_args,
    attached_value: CLValue.newCLUInt512(ticketPriceInMotes),
  });

  // Fetch the proxy WASM
  const wasm = await getProxyWASM();

  // Build the transaction using SessionBuilder
  const transaction = new SessionBuilder()
    .from(playerPublicKey)
    .runtimeArgs(runtimeArgs)
    .wasm(wasm)
    .payment(parseInt(gasPriceInMotes))
    .chainName('casper-test')
    .build();

  return transaction;
}
```

**Source:** `lottery-demo-dapp/client/src/app/services/requests/play-requests.ts` (verified working implementation)

**When to use:**
- ODRA contracts with `#[odra(payable)]`
- Any contract call requiring CSPR transfer
- Entry points that need attached value

---

## Why Proxy WASM is Required

### The Technical Limitation

**casper-js-sdk v5 provides NO direct way to send attached value with ContractCallBuilder.**

Looking at the API:
- `ContractCallBuilder` has `.byPackageHash()` and `.entryPoint()` but **NO `.amount()` or `.attachedValue()`**
- `SessionBuilder` has `.wasm()` but **NO `.entryPoint()` or `.packageHash()`**
- Neither builder supports payable contract calls directly

### The Proxy WASM Solution

The proxy WASM is a small wrapper contract that:

1. **Accepts** the attached value
2. **Receives** the target contract, entry point, and args as runtime arguments
3. **Forwards** the call to the real contract with the attached value
4. **Returns** the result

**Proxy WASM Arguments (this proxy build):**
```typescript
{
  contract_package_hash: CLValue.newCLByteArray(...), // Target package hash (32 bytes)
  entry_point: CLValue.newCLString('method'),         // Target entry point
  args: CLValue.newCLList(...),                       // Serialized Args as List<U8>
  attached_value: CLValue.newCLUInt512(value),        // Value to attach
}
```

---

## Sending Transactions via CSPR.click Wallet

Once you have the transaction, send it via CSPR.click:

```typescript
import { PublicKey } from 'casper-js-sdk';

// Prepare transaction
const transaction = await prepareEnterLotteryTransaction(playerPublicKey);

// Get CSPR.click instance
const csprclick = window.csprclick;

// Send transaction
await csprclick.send(
  { Version1: transaction.toJSON() },
  playerPublicKey.toHex(),
  (status: string, data?: any) => {
    console.log('Transaction status:', status, data);

    if (status === 'PROCESSED') {
      const deployHash = data.csprCloudTransaction.deploy_hash;
      console.log('Success! Deploy hash:', deployHash);
    }
  }
);
```

---

## Complete Working Example

See our implementation:
- **Non-payable:** `autonom_src/casper_commit.js` (Coordinator contract)
- **Payable:** `lib/casper/lottery-contract.ts` (LotteryRng contract)
- **Reference:** `lottery-demo-dapp/client/src/app/services/requests/play-requests.ts`

---

## Key Files

### Required Files
- `/public/proxy_caller.wasm` - Proxy WASM contract (33KB)
- `lib/casper/lottery-contract.ts` - Transaction builder

### Configuration
```typescript
// lib/config.ts
export interface LotteryConfig {
  chainName: string;                    // 'casper-test' or 'casper'
  rpcUrl: string;                       // Node RPC URL
  lotteryRngPackageHash: string;        // Contract package hash
  ticketPriceCspr: number;              // Ticket price in CSPR
  gasPriceCspr: number;                 // Gas price in CSPR
}
```

---

## Common Errors and Solutions

### Error: `entryPoint is not a function`
**Cause:** Using non-existent SessionBuilder methods
**Solution:** Use proxy WASM pattern or ContractCallBuilder

### Error: `Failed to fetch proxy WASM`
**Cause:** `proxy_caller.wasm` not in `/public/` directory
**Solution:** Copy proxy WASM to public directory

### Error: `InsufficientPayment`
**Cause:** Attached value doesn't match ticket price
**Solution:** Ensure `amount` and `attached_value` match contract requirements

### Error: `Transaction cancelled by user`
**Cause:** User rejected in wallet
**Solution:** Handle in status callback

---

## Testing

1. **Build:** `npm run build` - Should succeed with no errors
2. **Connect:** Connect CSPR.click wallet
3. **Execute:** Click "Buy Ticket" button
4. **Verify:** Check transaction on CSPR.live explorer

---

## References

### Working Implementations
- **Lottery Demo App:** `../../lotto/lottery-demo-dapp/`
  - Client: `client/src/app/services/requests/play-requests.ts`
  - Server: `server/src/resources/proxy_caller.wasm`

- **Autonom Backend:** `../../autonom_src/`
  - Commit script: `casper_commit.js` (ContractCallBuilder example)
  - Coordinator: `src/rng/coordinator_contract.rs` (Rust TransactionV1Builder)

### SDK Documentation
- Migration Guide: `node_modules/casper-js-sdk/resources/migration-guide-v2-v5.md`
- Transaction Builders: `node_modules/casper-js-sdk/resources/transaction-builder.md`
- Type Definitions: `node_modules/casper-js-sdk/dist/types/TransactionBuilder.d.ts`

### Contract Source
- LotteryRng: `../contracts/src/lottery_rng.rs`
- Coordinator: `../contracts/src/coordinator.rs`

---

## Summary

| Use Case | Builder | Pattern | Attached Value |
|----------|---------|---------|----------------|
| Non-payable calls | `ContractCallBuilder` | `.byPackageHash().entryPoint()` | ❌ No |
| Payable calls | `SessionBuilder` | `.wasm(proxyWasm).runtimeArgs()` | ✅ Yes |
| WASM deployment | `SessionBuilder` | `.wasm().installOrUpgrade()` | ❌ No |

**Key Insight:** casper-js-sdk v5 requires proxy WASM for payable contract calls because neither `ContractCallBuilder` nor `SessionBuilder` supports attached value directly.
