# Sailfish SDK

TypeScript SDK for real-time Solana DEX data. Stream trades, token launches, pool creations, and bonding curve graduations via WebSocket. Query historical trades, OHLCV candles with technical indicators, and pool/token metadata via REST.

Supports Raydium, PumpFun, PumpSwap, and Meteora.

---

## Get Your API Key

Sign up at [0xfire.com](https://0xfire.com) to get your API key and endpoint URL.

---

## Installation

```bash
npm install github:0xfire-org/sailfish-sdk
```

---

## Quick Start

### Stream Real-Time Trades

```ts
import { Sailfish } from "sailfish-sdk";

const sailfish = new Sailfish({
  url: "https://free.sailfish.solanavibestation.com",
  apiKey: "your-api-key",
  filter: {
    token_addresses: [],
    pool_addresses: [],
    dex_types: ["PumpFun", "PumpSwap"],
  },
  callbacks: {
    // Only define the callbacks you care about
    onTokenInit: (token) => console.log("New token:", token.mint),
    onTokenGraduate: (poolInit) => console.log("Graduated:", poolInit.pool_address),
    onPoolInit: (poolInit) => console.log("New pool:", poolInit.pool_address),
    onTrade: (trade) => console.log("Trade:", trade.pool_address, trade.price),
  },
});

// Start streaming
sailfish.swim();

// Update filters on the fly
sailfish.updateFilter({
  token_addresses: [],
  pool_addresses: ["3ucNos4NbumPLZNWztqGHNFFgkHeRMBQAVemeeomsUxv"],
  dex_types: [],
});

// Stop streaming
sailfish.rest();
```

### Query Historical Data

REST methods are available directly on the `Sailfish` instance — no need for a separate client:

```ts
import { Sailfish, CandleInterval, CandlePrice, PoolType } from "sailfish-sdk";

const sailfish = new Sailfish({
  url: "https://free.sailfish.solanavibestation.com",
  apiKey: "your-api-key",
});

// Get the latest block height
const latestBlock = await sailfish.fetchLatestBlock();

// Fetch pool info
const pool = await sailfish.fetchPoolInfo("3ucNos4NbumPLZNWztqGHNFFgkHeRMBQAVemeeomsUxv");

// Fetch token info
const token = await sailfish.fetchTokenInfo("So11111111111111111111111111111111111111112");

// Search pools by token symbol
const pools = await sailfish.fetchPoolInfoFuzzy({
  token_symbol: "BONK",
  similarity_threshold: 0.3,
});

// Fetch trades
const trades = await sailfish.fetchTrades({
  lower_tick: latestBlock - 1000,
  upper_tick: latestBlock,
  pool_types: [],
  pool_addresses: ["3ucNos4NbumPLZNWztqGHNFFgkHeRMBQAVemeeomsUxv"],
  token_addresses: [],
  to_wallets: [],
  from_wallets: [],
});

// Fetch OHLCV candles with technical indicators
const { candles, indicators } = await sailfish.fetchCandles({
  lower_tick: latestBlock - 1000,
  upper_tick: latestBlock,
  candle_interval: CandleInterval.Minutes1,
  pool_address: "3ucNos4NbumPLZNWztqGHNFFgkHeRMBQAVemeeomsUxv",
  indicators: {
    sma_20: { type: "simple_moving_average", period: 20, price: CandlePrice.Close },
    bb_20: { type: "bollinger_bands", period: 20, multiplier: 2.0, price: CandlePrice.Close },
    rsi_14: { type: "relative_strength_index", period: 14, price: CandlePrice.Close },
    obv: { type: "on_balance_volume" },
  },
});

// Fetch bonding curve graduations
const graduations = await sailfish.fetchRawGraduations({
  lower_tick: latestBlock - 1000,
  upper_tick: latestBlock,
  pool_types: [PoolType.PumpFunAmm, PoolType.RaydiumLaunchpad],
  pool_addresses: [],
  token_addresses: [],
});
```

---

## WebSocket Events

The `filter` controls which events you receive. All three fields are arrays that act as allowlists -- leave empty to receive everything.

| Field | Description |
|---|---|
| `token_addresses` | Filter by specific token mint addresses |
| `pool_addresses` | Filter by specific pool addresses |
| `dex_types` | Filter by DEX type (e.g. `"PumpFun"`, `"PumpSwap"`, `"Raydium"`, `"Meteora"`) |

### Event Callbacks

| Callback | Fires when |
|---|---|
| `onTokenInit` | A new token is created on-chain |
| `onTokenMint` | Tokens are minted to an account |
| `onPoolInit` | A new liquidity pool is created |
| `onTokenGraduate` | A bonding curve token graduates to a DEX pool |
| `onTradeRaw` | A swap occurs (raw on-chain data) |
| `onTrade` | A swap occurs (normalized with quote/base amounts and price) |
| `onMessage` | Any message not matched by the above |

`onTrade` requires cached pool info to normalize raw trades. Use `fetchPoolInfo` or `buildPoolInfoFromPoolInit` to populate the cache before streaming.

---

## Supported DEXes

| Pool Type | DEX |
|---|---|
| `RaydiumAmm` | Raydium AMM |
| `RaydiumCpmm` | Raydium CPMM |
| `RaydiumClmm` | Raydium CLMM |
| `RaydiumLaunchpad` | Raydium Launchpad |
| `PumpSwapAmm` | PumpSwap AMM |
| `PumpFunAmm` | PumpFun Bonding Curve |
| `MeteoraDyn` | Meteora Dynamic |
| `MeteoraDynV2` | Meteora Dynamic V2 |
| `MeteoraDlmm` | Meteora DLMM |

---

## Technical Indicators

Available on the candles endpoint:

| Indicator | Config Type | Parameters |
|---|---|---|
| Simple Moving Average | `simple_moving_average` | `period`, `price` |
| Bollinger Bands | `bollinger_bands` | `period`, `multiplier`, `price` |
| Relative Strength Index | `relative_strength_index` | `period`, `price` |
| On-Balance Volume | `on_balance_volume` | -- |

`price` is one of: `open`, `high`, `low`, `close`.

---

## Polymarket

Stream real-time orderbooks from Polymarket prediction markets:

```ts
import { PolymarketSailfish } from "sailfish-sdk";

const sailfish = new PolymarketSailfish({
  url: "https://polymarket-sailfish.0xfire.com",
  callbacks: {
    onMessage: (msg) => {},
    onMarketOrdebooks: (data) => {
      console.log(data.market_slug, data.question);
      console.log("Yes bids:", data.orderbook_0.bids.levels);
      console.log("No asks:", data.orderbook_1.asks.levels);
    },
  },
  filter: {},
});

sailfish.swim();
```

---

## Local Development

```bash
git clone https://github.com/0xfire-org/sailfish-sdk.git
cd sailfish-sdk
npm install
npm run build

# Link for local usage
npm link
cd ../your-project
npm link sailfish-sdk
```

### Running Tests

```bash
# Create .env.test with your API key
echo "API_KEY=your-api-key" > .env.test

npm test
```

---

## License

ISC
