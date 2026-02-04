import axios, { Method } from "axios";
import type { PoolInfo, TokenInfo, TradesQuery, Trade, GraduatedPoolsQuery, RawGraduations, CandlesResponse, CandlesQuery } from "./types";
import { AuthHeaders, SailfishTier } from "./tier";

export class SailfishApi {
  private readonly tier: SailfishTier;
  private readonly baseUrl: string;
  private readonly authHeaders: AuthHeaders;

  constructor({ tier }: { tier: SailfishTier }) {
    const { baseUrl, authHeaders } = SailfishTier.httpBaseUrl(tier);
    this.tier = tier;
    this.baseUrl = baseUrl;
    this.authHeaders = authHeaders;
  }

  public async fetchLatestBlock(): Promise<number> {
    return this.httpRequest("GET", "/tick");
  }

  public async fetchPoolInfo(address: string): Promise<PoolInfo> {
    return this.httpRequest("POST", "/sailfish/pools/query", address);
  }

  public async fetchTokenInfo(address: string): Promise<TokenInfo> {
    return this.httpRequest("POST", "/sailfish/tokens/query", address);
  }

  public async fetchTrades(query: TradesQuery): Promise<Record<string, Trade[]>> {
    return this.httpRequest("POST", "/sailfish/trades/query", query);
  }

  public async fetchCandles(query: CandlesQuery): Promise<CandlesResponse> {
    return this.httpRequest("POST", "/sailfish/candles/query", query);
  }

  public async fetchRawGraduations(query: GraduatedPoolsQuery): Promise<RawGraduations> {
    return this.httpRequest("POST", "/sailfish/graduated_pools_raw/query", query);
  }

  async httpRequest<ReqData, ResData>(method: Method, path: string, data?: ReqData): Promise<ResData> {
    const response = await axios.request({
      method,
      url: this.baseUrl + path,
      data,
      headers: {
        "Content-Type": "application/json",
        ...this.authHeaders,
      },
      timeout: 10 * 60 * 1000,
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch latest block: ${response.statusText}`);
    }

    return response.data;
  }
}
