import {
  type SimpleMarket,
  type MarketOrdebooks,
  type PolymarketSailfishCallbacks,
  PolymarketSailfishEventResource,
} from "./types";

import { SailfishWebsocket } from "../websocket";
import { SailfishMessage } from "../types";

type SailfishInit =
  | { filter: any, callbacks: PolymarketSailfishCallbacks }
  ;

export class Sailfish {
  private filter: any;
  private callbacks: PolymarketSailfishCallbacks;

  private ws: SailfishWebsocket | null;

  private markets: Record<string, SimpleMarket>; // market_slug -> market
  private orderbooks: Record<string, MarketOrdebooks>; // market_slug -> orderbook

  constructor({
    filter,
    callbacks,
  }: SailfishInit) {

    this.filter = filter;
    this.callbacks = callbacks;

    this.ws = null;

    this.markets = {};
    this.orderbooks = {};
  }

  public isRunning(): boolean {
    return this.ws !== null && this.ws.connected;
  }

  public swim() {
    if (this.ws !== null) {
      return;
    }

    this.ws = new SailfishWebsocket({
      botName: "polymarket-ws",
      tier: { type: "polymarket", apiKey: "polymarket-api-key" },
      filter: this.filter,
      callback: (message: SailfishMessage) => { this.onMessage(message) },
    });
  }

  public rest() {
    if (this.ws === null) {
      return;
    }

    this.ws.stop();
    this.ws = null;
  }

  public onMessage(message: SailfishMessage) {
    switch (message.resource) {
      case PolymarketSailfishEventResource.MarketOrdebooks: {
        const data = message.data as MarketOrdebooks;
        this.orderbooks[data.market_slug] = data;
        if (this.markets[data.market_slug] === undefined) {
          this.markets[data.market_slug] = {
            market_slug: data.market_slug,
            question: data.question,
            token_0: data.token_0,
            token_1: data.token_1,
            last_update_time: data.last_update_time,
          };
        }
        this.callbacks.onMarketOrdebooks(data);
        break;
      }
      default:
        this.callbacks.onMessage(message);
        break;
    }
  }

  public getMarkets(): Record<string, SimpleMarket> {
    return this.markets;
  }

  public getOrderbook(marketSlug: string): MarketOrdebooks | null {
    return this.orderbooks[marketSlug] ?? null;
  }

}