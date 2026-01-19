import { SailfishMessage } from "../types";


export enum PolymarketSailfishEventResource {
  MarketOrdebooks = "market-orderbooks",
}

export interface BookSide {
  levels: Record<string, string>,
}

export interface SimpleMarket {
  market_slug: string,
  question: string,
  token_0: string,
  token_1: string,
  last_update_time: string,
}

export interface Orderbook {
  bids: BookSide,
  asks: BookSide,
  tick_size: string,
}

export interface MarketOrdebooks {
  orderbook_0: Orderbook,
  orderbook_1: Orderbook,
  market_slug: string,
  question: string,
  token_0: string,
  token_1: string,
  last_update_time: string,
}

export type PolymarketSailfishCallbacks = {
  onMessage: (message: SailfishMessage) => void;
  onMarketOrdebooks: (message: MarketOrdebooks) => void;
};