import {
  type SimpleMarket,
  type MarketOrdebooks,
  type PolymarketSailfishCallbacks,
  type MarketsQuery,
  type MarketRow,
  type TradesByMarketQuery,
  type TradesByWalletQuery,
  type ApiTrade,
  type PaginatedResponse,
  type OrderbookUpdateMessage,
  PolymarketSailfishEventResource,
} from "./types.js";

import { PolymarketApi } from "./api.js";
import { PolymarketWebsocket } from "./websocket.js";
import { SailfishWebsocket } from "../websocket.js";
import { type SailfishConfig, type SailfishMessage } from "../types.js";

type PolymarketSailfishInit = SailfishConfig & {
  filter?: any;
  callbacks?: PolymarketSailfishCallbacks;
};

export class PolymarketSailfish {
  private readonly config: SailfishConfig;
  private filter: any;
  private callbacks: PolymarketSailfishCallbacks;

  private ws: SailfishWebsocket | null;
  private api: PolymarketApi;
  private subWs: PolymarketWebsocket | null;

  private markets: Record<string, SimpleMarket>; // market_slug -> market
  private orderbooks: Record<string, MarketOrdebooks>; // market_slug -> orderbook

  constructor({
    filter,
    callbacks,
    ...config
  }: PolymarketSailfishInit) {
    this.config = config;

    this.filter = filter ?? {};
    this.callbacks = callbacks ?? {};

    this.ws = null;
    this.api = new PolymarketApi(config);
    this.subWs = null;

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
      ...this.config,
      botName: "polymarket-ws",
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
        this.callbacks.onMarketOrdebooks?.(data);
        break;
      }
      default:
        this.callbacks.onMessage?.(message);
        break;
    }
  }

  public getMarkets(): Record<string, SimpleMarket> {
    return this.markets;
  }

  public getOrderbook(marketSlug: string): MarketOrdebooks | null {
    return this.orderbooks[marketSlug] ?? null;
  }

  // --- REST API ---

  public async fetchMarkets(query?: MarketsQuery): Promise<PaginatedResponse<MarketRow>> {
    return this.api.fetchMarkets(query);
  }

  public async fetchTradesByMarket(
    conditionId: string,
    query?: TradesByMarketQuery,
  ): Promise<PaginatedResponse<ApiTrade>> {
    return this.api.fetchTradesByMarket(conditionId, query);
  }

  public async fetchTradesByWallet(
    address: string,
    query?: TradesByWalletQuery,
  ): Promise<PaginatedResponse<ApiTrade>> {
    return this.api.fetchTradesByWallet(address, query);
  }

  // --- Subscription WebSocket ---

  public startSubscriptionWs(): void {
    if (this.subWs !== null) return;
    this.subWs = new PolymarketWebsocket({
      ...this.config,
      botName: "polymarket-sub-ws",
      onOrderbookUpdate: (update: OrderbookUpdateMessage) => {
        this.onSubscriptionUpdate(update);
      },
    });
  }

  public stopSubscriptionWs(): void {
    if (this.subWs === null) return;
    this.subWs.stop();
    this.subWs = null;
  }

  public subscribe(conditionId: string): void {
    if (this.subWs === null) {
      this.startSubscriptionWs();
    }
    this.subWs!.subscribe(conditionId);
  }

  public unsubscribe(conditionId: string): void {
    this.subWs?.unsubscribe(conditionId);
  }

  public getSubscriptions(): string[] {
    return this.subWs?.getSubscriptions() ?? [];
  }

  private onSubscriptionUpdate(update: OrderbookUpdateMessage): void {
    const data = update.data;
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
    this.callbacks.onOrderbookUpdate?.(update);
  }

}