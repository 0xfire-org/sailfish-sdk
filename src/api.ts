import axios, { Method } from "axios";
import type { PoolInfo, TokenInfo, TradesQuery, Trade, GraduatedPoolsQuery, RawGraduations, CandlesResponse, CandlesQuery, FuzzyPoolInfoQuery, SailfishConfig, AuthHeaders } from "./types.js";
import { resolveConfig } from "./types.js";

export class SailfishApi {
  private readonly baseUrl: string;
  private readonly authHeaders: AuthHeaders;

  constructor(config: SailfishConfig) {
    const resolved = resolveConfig(config);
    this.baseUrl = resolved.httpBaseUrl;
    this.authHeaders = resolved.authHeaders;
  }

  public async fetchLatestBlock(): Promise<number> {
    return this.httpRequest("GET", "/tick");
  }

  public async fetchPoolInfo(address: string): Promise<PoolInfo> {
    return this.httpRequest("POST", "/sailfish/pools/query", address);
  }

  public async fetchPoolInfoFuzzy(query: FuzzyPoolInfoQuery): Promise<PoolInfo[]> {
    return this.httpRequest("POST", "/sailfish/pools/fuzzy-query", query);
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
    const url = this.baseUrl + path;

    const response = await axios.request({
      method,
      url,
      data,
      headers: {
        "Content-Type": "application/json",
        ...this.authHeaders,
      },
      timeout: 10 * 60 * 1000,
    });

    return response.data;
  }
}
