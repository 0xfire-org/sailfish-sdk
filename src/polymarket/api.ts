import axios from "axios";
import type { SailfishConfig, AuthHeaders } from "../types.js";
import { resolveConfig } from "../types.js";
import type {
  MarketsQuery,
  MarketRow,
  TradesByMarketQuery,
  TradesByWalletQuery,
  ApiTrade,
  PaginatedResponse,
} from "./types.js";

export class PolymarketApi {
  private readonly baseUrl: string;
  private readonly authHeaders: AuthHeaders;

  constructor(config: SailfishConfig) {
    const resolved = resolveConfig(config);
    this.baseUrl = resolved.httpBaseUrl;
    this.authHeaders = resolved.authHeaders;
  }

  public async fetchMarkets(query?: MarketsQuery): Promise<PaginatedResponse<MarketRow>> {
    return this.httpGet("/api/markets", query);
  }

  public async fetchTradesByMarket(
    conditionId: string,
    query?: TradesByMarketQuery,
  ): Promise<PaginatedResponse<ApiTrade>> {
    return this.httpGet(`/api/trades/${encodeURIComponent(conditionId)}`, query);
  }

  public async fetchTradesByWallet(
    address: string,
    query?: TradesByWalletQuery,
  ): Promise<PaginatedResponse<ApiTrade>> {
    return this.httpGet(`/api/trades/wallet/${encodeURIComponent(address)}`, query);
  }

  private async httpGet<T>(path: string, params?: Record<string, any>): Promise<T> {
    const cleanParams = params
      ? Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined))
      : undefined;

    const response = await axios.request({
      method: "GET",
      url: this.baseUrl + path,
      params: cleanParams,
      headers: { ...this.authHeaders },
      timeout: 10 * 60 * 1000,
    });

    return response.data;
  }
}
