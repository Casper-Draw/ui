# Casper Draw - LotteryRng Integration Guide

## Overview

The Casper Draw UI has been successfully integrated with the deployed LotteryRng smart contract on Casper Testnet. The "Buy Ticket for 50 CSPR" button now makes real on-chain calls to `enter_lottery()`.

## What Was Implemented

### 1. Environment Configuration (`.env.local`)
- Configured contract package hashes for LotteryRng and Coordinator
- Set up Casper Testnet RPC endpoint
- Configured CSPR.click App ID and settings
- Defined lottery parameters (ticket price, fees, gas)

### 2. Configuration Service (`lib/config.ts`)
- Type-safe configuration management
- Environment variable validation
- CSPR to motes conversion utilities
- Centralized configuration access

### 3. Contract Service (`lib/casper/lottery-contract.ts`)
- `prepareEnterLotteryTransaction()`: Builds the transaction to call enter_lottery()
- `handleTransactionStatus()`: Processes wallet transaction callbacks
- `getExplorerUrl()`: Generates CSPR.live explorer links
- `getCsprClick()`: Safely accesses CSPR.click SDK

### 4. UI Integration (`components/EnterLottery.tsx`)
- Real blockchain transaction flow
- Wallet connection validation
- Transaction status updates with loading states
- Success/error toast notifications with explorer links
- Deploy hash display after successful transaction

## How to Test

### Prerequisites
1. **Casper Wallet** installed and configured for Testnet
   - Install from: https://www.casperwallet.io/
   - Switch to Casper Testnet in wallet settings

2. **Testnet CSPR Tokens**
   - Get testnet CSPR from faucet: https://testnet.cspr.live/tools/faucet
   - You need at least 60 CSPR (50 for ticket + ~10 for gas)

### Step 1: Start the Development Server

```bash
cd /home/botvenom/Desktop/work/web3/casper/MAIN/casper_draw
npm run dev
```

The app will be available at: http://localhost:3000

### Step 2: Connect Your Wallet

1. Navigate to the application
2. Click "Connect Casper Wallet" button
3. Approve the connection in your Casper Wallet
4. Verify your account is connected (you'll see your address in the header)

### Step 3: Buy a Lottery Ticket

1. Navigate to "Let's Play!" page
2. Click "Buy Ticket for 50 CSPR"
3. **In Casper Wallet**:
   - Review the transaction details:
     - Entry Point: `enter_lottery`
     - Package Hash: `hash-3d350948a75b4be3d2a801339c75157fb8e79513dddd3dc42809988a99acad6e`
     - Amount: 50,000,000,000 motes (50 CSPR)
     - Payment: 10,000,000,000 motes (10 CSPR gas)
   - Click "Sign" to approve

4. **Wait for Confirmation**:
   - The button will show "Processing Transaction..."
   - This usually takes 10-30 seconds on Testnet

5. **Transaction Complete**:
   - Success toast will appear with "View on Explorer" link
   - Deploy hash will be displayed below the button
   - You'll be redirected to Dashboard after 2 seconds

### Step 4: Verify on Blockchain

1. Click the "View on Explorer" link in the toast notification, OR
2. Copy the deploy hash and visit: https://testnet.cspr.live/deploy/{deploy-hash}

3. **Check Transaction Details**:
   - Verify status is "Success"
   - Check entry point is "enter_lottery"
   - Confirm amount transferred is 50 CSPR
   - Look for `PlayPending` event in transaction events

4. **Expected Event Data** (in transaction events):
   - Event: `PlayPending`
   - `request_id`: U256 (RNG request identifier)
   - `play_id`: U256 (unique play identifier)
   - `round_id`: u32 (current lottery round)
   - `player`: Your account address
   - `timestamp`: Transaction timestamp

## Deployed Contracts

### LotteryRng Contract
- **Package Hash**: `hash-3d350948a75b4be3d2a801339c75157fb8e79513dddd3dc42809988a99acad6e`
- **Network**: Casper Testnet
- **Entry Point Used**: `enter_lottery()`

### Coordinator Contract
- **Package Hash**: `hash-be55d572a0e304eb2fe5f18e8fa214b8c19a00df2d3c5c4d5364b53363dc66c7`
- **Network**: Casper Testnet
- **Purpose**: Provides randomness fulfillment for the lottery

## Transaction Flow

```
1. User clicks "Buy Ticket"
   ↓
2. App prepares enter_lottery() transaction
   - Entry point: "enter_lottery"
   - Package hash: LotteryRng
   - Amount: 50 CSPR
   - Args: {} (empty)
   ↓
3. Transaction sent to CSPR.click wallet
   ↓
4. User signs in wallet
   ↓
5. Transaction submitted to Casper Network
   ↓
6. Transaction confirmed (10-30 seconds)
   ↓
7. PlayPending event emitted with request_id
   ↓
8. UI shows success + deploy hash
   ↓
9. [FUTURE] Poll for randomness fulfillment
   ↓
10. [FUTURE] Call settle_lottery(request_id)
```

## Configuration Reference

### Environment Variables

```bash
# Network
NEXT_PUBLIC_CASPER_CHAIN_NAME=casper-test
NEXT_PUBLIC_CASPER_RPC_URL=https://rpc.testnet.casperlabs.io/rpc

# Contracts
NEXT_PUBLIC_LOTTERY_RNG_PACKAGE_HASH=hash-3d350948a75b4be3d2a801339c75157fb8e79513dddd3dc42809988a99acad6e
NEXT_PUBLIC_COORDINATOR_PACKAGE_HASH=hash-be55d572a0e304eb2fe5f18e8fa214b8c19a00df2d3c5c4d5364b53363dc66c7

# Lottery Parameters
NEXT_PUBLIC_TICKET_PRICE_CSPR=50
NEXT_PUBLIC_LOTTERY_FEE_CSPR=1
NEXT_PUBLIC_GAS_PRICE_CSPR=10

# CSPR.click
NEXT_PUBLIC_CSPRCLICK_APP_ID=5570e200-a6b6-4cdb-8006-2b95edd2
NEXT_PUBLIC_CSPRCLICK_DIGEST=cdd05c21fe0c4511b831cdb4db352e5f

# Explorer
NEXT_PUBLIC_CSPR_LIVE_URL=https://testnet.cspr.live
```

## Troubleshooting

### "CSPR.click not initialized"
- Ensure you're using a browser that supports web extensions
- Check that Casper Wallet extension is installed and enabled
- Refresh the page and try again

### "Transaction failed"
- Check you have enough CSPR (need 60+ CSPR for ticket + gas)
- Verify you're on Casper Testnet, not Mainnet
- Check the error message in the toast notification

### "Transaction timed out"
- Casper Testnet can be slow during high usage
- Check CSPR.live to see if transaction is still pending
- Transaction may still complete - check Dashboard after a few minutes

### Transaction successful but no PlayPending event
- This indicates the contract call failed
- Check the deploy details on CSPR.live for error messages
- Verify package hash is correct in `.env.local`

## What's Next?

This implementation covers **Step 1** of the lottery flow (entering the lottery). Future phases will include:

1. **Step 2: Settle Lottery**
   - Monitor Coordinator for randomness fulfillment
   - Call `settle_lottery(request_id)` to reveal results
   - Display win/loss in UI

2. **Backend Event Monitoring**
   - Create backend service to listen for PlayPending events
   - Store pending plays in database
   - Trigger automatic settlement when randomness is ready

3. **Complete Dashboard**
   - Show pending tickets with real request_ids
   - Allow manual settlement of tickets
   - Display actual prize amounts from blockchain
   - Show real round and play_id information

4. **Contract State Queries**
   - Query current prize pool
   - Get current round number
   - Fetch jackpot/consolation probabilities
   - Read max consolation prize

## Files Modified

1. `.env.local` - Environment configuration
2. `lib/config.ts` - Configuration service (NEW)
3. `lib/casper/lottery-contract.ts` - Contract interaction service (NEW)
4. `components/EnterLottery.tsx` - Updated to use real transactions
5. `next.config.mjs` - Build configuration update

## Key Code Locations

- **Transaction preparation**: `lib/casper/lottery-contract.ts:29-62`
- **Transaction sending**: `components/EnterLottery.tsx:96-175`
- **Status handling**: `lib/casper/lottery-contract.ts:88-120`
- **Configuration**: `lib/config.ts:25-65`

## Support

For issues or questions:
1. Check Casper Network documentation: https://docs.casper.network
2. CSPR.click SDK docs: https://github.com/make-software/casper-wallet-sdk
3. Casper Discord: https://discord.gg/casperblockchain

---

**Status**: ✅ Integration Complete - `enter_lottery()` is now functional
**Next Phase**: Implement `settle_lottery()` and event monitoring
