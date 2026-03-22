/**
 * Simple test file for Polymarket Sailfish websocket streaming
 * 
 * To run this file:
 *   npm run test:polymarket
 * 
 * Or directly with tsx:
 *   npx tsx test-polymarket-ws.ts
 */

import { PolymarketSailfish } from "./src/polymarket/sailfish";
import type { MarketOrdebooks, PolymarketSailfishCallbacks } from "./src/polymarket/types";
import type { SailfishMessage } from "./src/types";

// Set up callbacks to handle incoming messages
const callbacks: PolymarketSailfishCallbacks = {
  onMessage: (message: SailfishMessage) => {

  },

  onMarketOrdebooks: (orderbook: MarketOrdebooks) => {
    const pretty_json = JSON.stringify(orderbook, null, 2);
    console.log(pretty_json);
  },
};

// Create filter - adjust based on what markets you want to stream
// For Polymarket, the filter structure may vary - using an empty object as a starting point
// You may need to adjust this based on the actual API requirements
const filter: any = {
  // Example: filter by specific market slugs if needed
  // market_slugs: ["some-market-slug"],
};

// Create the Sailfish instance
const sailfish = new PolymarketSailfish({
  url: "https://polymarket-sailfish.0xfire.com",
  filter,
  callbacks,
});

// Start the websocket connection
console.log("🚀 Starting Polymarket Sailfish websocket...");
sailfish.swim();

// Check connection status periodically
const statusInterval = setInterval(() => {
  if (sailfish.isRunning()) {
    console.log("✅ WebSocket is running");
    const markets = sailfish.getMarkets();
    const marketCount = Object.keys(markets).length;
    if (marketCount > 0) {
      console.log(`📈 Tracking ${marketCount} market(s):`);
      Object.values(markets).forEach((market) => {
        console.log(`  - ${market.market_slug}: ${market.question}`);
      });
    }
  } else {
    console.log("⏳ WebSocket connecting...");
  }
}, 5000);

// Graceful shutdown on Ctrl+C
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down...");
  clearInterval(statusInterval);
  sailfish.rest();
  console.log("👋 Goodbye!");
  process.exit(0);
});

// Keep the process alive
console.log("Press Ctrl+C to stop the websocket stream\n");
