# Troubleshooting On-Chain Transactions

## Transaction Shows in Wallet But Doesn't Complete

### Checklist:

#### 1. Check Package Hash Format
```bash
# Your .env should have:
NEXT_PUBLIC_LOTTERY_RNG_PACKAGE_HASH=abc123...  # WITHOUT 'hash-' prefix
# OR
NEXT_PUBLIC_LOTTERY_RNG_PACKAGE_HASH=hash-abc123...  # WITH 'hash-' prefix (code removes it)
```

#### 2. Verify Network
- Wallet network: casper-test
- RPC URL: https://node.testnet.casper.network/rpc
- Chain name in .env: casper-test

#### 3. Check Console Logs
Look for transaction params:
```javascript
🔧 Transaction params: {
  ticketPriceInMotes: "50000000000",  // 50 CSPR
  gasPriceInMotes: "5000000000",      // 5 CSPR
  packageHash: "...",                 // Should NOT have 'hash-' prefix
  chainName: "casper-test",
  wasmSize: 33651                     // Should be ~33KB
}
```

#### 4. Wallet Balance
Ensure you have at least:
- Ticket price: 50 CSPR
- Gas: 5 CSPR
- **Total: ~55 CSPR minimum**

#### 5. Transaction JSON Structure
Should contain:
```json
{
  "Version1": {
    "session": {
      "moduleBytes": {
        "moduleBytes": "...",  // Base64 encoded WASM
        "args": [[...]]         // Runtime args
      }
    },
    "payment": {...},
    "initiatorAddr": {...},
    "chainName": "casper-test"
  }
}
```

### Common Errors:

#### Error: "Insufficient funds"
**Solution:** Add more CSPR to your wallet
- Get testnet CSPR from faucet: https://testnet.cspr.live/tools/faucet

#### Error: "Invalid package hash"
**Solution:** Check the package hash format
```typescript
// Should be 64 hex characters (32 bytes)
const hash = "abc123..."; // 64 chars, no 'hash-' prefix
```

#### Error: "Entry point not found"
**Solution:** Verify contract deployment
```bash
# Check contract on explorer
https://testnet.cspr.live/contract-package/<your-package-hash>
```

#### Transaction stays "pending" forever
**Possible causes:**
1. Wrong network (mainnet vs testnet)
2. RPC node down
3. Gas too low
4. Contract execution error

**Debug steps:**
1. Check transaction hash on explorer
2. Look for execution errors
3. Verify contract state

### Wallet-Specific Issues:

#### Casper Wallet Extension

**Transaction not appearing:**
- Refresh the page
- Disconnect and reconnect wallet
- Check wallet is unlocked

**Transaction rejected:**
- User clicked "Reject"
- Wallet detected invalid transaction
- Check console for wallet errors

#### CSPR.click Issues

**Status callback not firing:**
```typescript
// Ensure callback is properly structured
csprclick.send(
  { Version1: transaction.toJSON() },
  publicKey.toHex(),
  (status, data) => {
    console.log('Status:', status);  // Should log SENT, PROCESSED, etc.
    console.log('Data:', data);
  }
);
```

### Network Debugging:

#### Check RPC Connection
```bash
curl https://node.testnet.casper.network/rpc \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "info_get_status",
    "id": 1
  }'
```

Should return node status.

#### Verify Contract Deployment
```bash
curl https://node.testnet.casper.network/rpc \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "state_get_item",
    "params": {
      "state_root_hash": "...",
      "key": "hash-YOUR_PACKAGE_HASH"
    },
    "id": 1
  }'
```

### Quick Fixes:

#### 1. Clear Next.js Cache
```bash
rm -rf .next
npm run dev
```

#### 2. Verify Proxy WASM
```bash
ls -lh public/proxy_caller.wasm
# Should show ~33KB file
```

#### 3. Test Transaction Build
```typescript
// Add this to console:
const tx = await prepareEnterLotteryTransaction(publicKey);
console.log('Transaction:', tx.toJSON());
```

#### 4. Check Environment Variables
```bash
cat .env.local | grep LOTTERY_RNG_PACKAGE_HASH
cat .env.local | grep CHAIN_NAME
cat .env.local | grep TICKET_PRICE
```

### Still Not Working?

#### Collect Debug Info:
1. Console logs (🔧 Transaction params)
2. Transaction JSON (📦 Transaction JSON)
3. Wallet error message
4. Network tab showing /proxy_caller.wasm request
5. Environment variables (redact sensitive info)

#### Compare with Working Demo:
```bash
# Run the lottery demo app
cd ../../lotto/lottery-demo-dapp/client
npm install
npm start

# Test if their transaction works
# Compare transaction structure
```

#### Test with Direct Contract Call (Non-Payable):
```typescript
// Try calling a read-only method first
import { ContractCallBuilder } from 'casper-js-sdk';

const tx = new ContractCallBuilder()
  .from(publicKey)
  .byPackageHash(packageHash)
  .entryPoint('get_current_round_id')  // Read-only method
  .runtimeArgs(Args.fromMap({}))
  .payment(1_000_000_000)
  .chainName('casper-test')
  .build();
```

If this works but the payable call doesn't, the issue is with the proxy WASM setup.
