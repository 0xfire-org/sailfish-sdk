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

// Note: The API key is currently hardcoded in the Sailfish class as "polymarket-api-key"
// You may need to update src/polymarket/sailfish.ts line 49 to use your actual API key
// or modify the class to accept an API key parameter

// Set up callbacks to handle incoming messages
const callbacks: PolymarketSailfishCallbacks = {
  onMessage: (message: SailfishMessage) => {
    const pretty_json = JSON.stringify(message, null, 2);
    console.log(pretty_json);
  },

  onMarketOrdebooks: (orderbook: MarketOrdebooks) => {
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
