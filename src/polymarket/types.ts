import { SailfishMessage } from "../types.js";

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
  condition_id?: string,
  question: string,
  token_0: string,
  token_1: string,
  last_update_time: string,
}

export type PolymarketSailfishCallbacks = {
  onMessage?: (message: SailfishMessage) => void;
  onMarketOrdebooks?: (message: MarketOrdebooks) => void;
  onOrderbookUpdate?: (update: OrderbookUpdateMessage) => void;
};

// --- Pagination ---

export type SortOrder = "asc" | "desc";

export type MarketSortBy = "market_slug" | "question" | "end_date_iso" | "condition_id" | "active";

export type TradeSortBy = "block_timestamp" | "price" | "shares" | "usdc" | "block_number";

export interface PaginationInfo {
  page: number;
  page_size: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

// --- Market Search ---

export interface MarketsQuery {
  page?: number;
  page_size?: number;
  sort_by?: MarketSortBy;
  sort_order?: SortOrder;
  slug?: string;
  question?: string;
  condition_id?: string;
  active?: boolean;
  created_after?: string;
  created_before?: string;
}

export interface MarketRow {
  condition_id: string;
  question_id: string;
  question: string;
  description: string;
  market_slug: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  end_date_iso: string | null;
  token_0_id: string | null;
  token_0_outcome: string | null;
  token_0_price: string | null;
  token_1_id: string | null;
  token_1_outcome: string | null;
  token_1_price: string | null;
  neg_risk: boolean;
  event_id: string | null;
  event_slug: string | null;
  tags: string[] | null;
}

// --- Trades ---

export interface TradesByMarketQuery {
  page?: number;
  page_size?: number;
  sort_by?: TradeSortBy;
  sort_order?: SortOrder;
}

export interface TradesByWalletQuery {
  page?: number;
  page_size?: number;
  sort_by?: TradeSortBy;
  sort_order?: SortOrder;
  condition_id?: string;
}

export interface ApiTrade {
  block_number: number;
  block_timestamp: string;
  tx_hash: string;
  log_index: number;
  wallet: string;
  role: string;
  side: string;
  shares: string;
  usdc: string;
  price: string;
  fee: string;
  token_id: string;
  condition_id: string | null;
  trade_type: string;
  order_hash: string;
}

// --- Subscription WebSocket ---

export interface OrderbookUpdateMessage {
  type: "orderbook_update";
  condition_id: string;
  data: MarketOrdebooks;
}