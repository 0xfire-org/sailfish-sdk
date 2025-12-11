# Sailfish SDK

Sailfish SDK is a JavaScript/TypeScript SDK for interacting with the Sailfish
API and WebSocket endpoints.\
It allows you to fetch pool and token information, subscribe to updates, and
listen to trades in real-time.

---

## 📦 Installation (GitHub Repo Only)

Install directly from GitHub — no npm registry required:

```bash
npm install github:0xfire-org/sailfish-sdk
# or
yarn add github:0xfire-org/sailfish-sdk
```

### ✅ Local Development Option

```bash
git clone https://github.com/0xfire-org/sailfish-sdk.git
cd sailfish-sdk
npm install
npm run build

# Link it for local usage
npm link
cd ../your-project
npm link sailfish-sdk
```

---

### Example

```ts
import { Sailfish, SailfishTier } from "sailfish-sdk";
import { DEFAULT_QUOTE_TOKEN_ADDRESSES } from "sailfish-sdk";

const sailfish = new Sailfish({
  tier: SailfishTier.free({ // <-- Switch between Free and Basic, based on your tier
    apiKey: "...", // <-- Replace with your API_KEY
  }),
  filter: {
    token_addresses: DEFAULT_QUOTE_TOKEN_ADDRESSES,
    pool_addresses: [],
    dex_types: [],
  },
  callbacks: {
    onMessage: (msg) => console.log("Message:", msg),
    onTokenInit: (token) => console.log("Token Init:", token),
    onTokenMint: (mint) => console.log("Token Mint:", mint),
    onTokenGraduate: (poolInit) => console.log("Token Graduate:", poolInit),
    onPoolInit: (poolInit) => console.log("Pool Init:", poolInit),
    onTradeRaw: (tradeRaw) => console.log("Trade Raw:", tradeRaw),
    onTrade: (trade) => console.log("Trade:", trade),
  },
});

async function example() {
  // Fetch pool info
  const pool = await sailfish.fetchPoolInfo("POOL_ADDRESS_HERE");
  if (pool instanceof Error) {
    console.error("Failed to fetch pool:", pool.message);
  } else {
    console.log("Pool info:", pool);
  }

  // Fetch token info
  const token = await sailfish.fetchTokenInfo("TOKEN_ADDRESS_HERE");
  if (token instanceof Error) {
    console.error("Failed to fetch token:", token.message);
  } else {
    console.log("Token info:", token);
  }
}

example();
```
