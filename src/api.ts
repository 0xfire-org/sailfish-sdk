import axios from "axios";
import type { PoolInfo, TokenInfo, TradesQuery, Trade, GraduatedPoolsQuery, RawGraduations } from "./types";
import { PRODUCTION_API_URL } from "./constants";

const AXIOS_CONFIG = { headers: { "Content-Type": "application/json" }, timeout: 10 * 60 * 1000 };
export class SailfishApi {
  private baseUrl: string;
  constructor(
    baseUrl: string = PRODUCTION_API_URL,
  ) {
    this.baseUrl = baseUrl;
  }

  public async fetchLatestBlock(): Promise<number | Error> {
    const url = `${this.baseUrl}/tick`;
    const response = await axios.get<number>(url, AXIOS_CONFIG);
    if (response.status !== 200) {
      return new Error(`Failed to fetch latest block: ${response.statusText}`);
    }
    return response.data;
  }

  public async fetchPoolInfo(address: string): Promise<PoolInfo | Error> {
    const url = `${this.baseUrl}/sailfish/pools/query`;
    const response = await axios.post<PoolInfo>(url, address, AXIOS_CONFIG);
    if (response.status !== 200) {
      return new Error(`Failed to fetch pool info: ${response.statusText}`);
    }
    return response.data;
  }

  public async fetchTokenInfo(address: string): Promise<TokenInfo | Error> {
    const url = `${this.baseUrl}/sailfish/tokens/query`;
    const response = await axios.post<TokenInfo>(url, address, AXIOS_CONFIG);
    if (response.status !== 200) {
      return new Error(`Failed to fetch token info: ${response.statusText}`);
    }
    return response.data;
  }

  public async fetchTrades(query: TradesQuery): Promise<Record<string, Trade[]> | Error> {
    const url = `${this.baseUrl}/sailfish/trades/query`;
    try {
      const response = await axios.post<Record<string, Trade[]>>(url, query, AXIOS_CONFIG);
      if (response.status !== 200) {
        return new Error(`Failed to fetch trades: ${response.statusText}`);
      }
      return response.data as Record<string, Trade[]>;
    } catch (error) {
      if (error instanceof Error) {
        return error;
      }
      return new Error(`Unexpected error: ${error}`);
    }
  }

  public async fetchRawGraduations(query: GraduatedPoolsQuery): Promise<RawGraduations | Error> {
    const url = `${this.baseUrl}/sailfish/graduated_pools_raw/query`;
    try {
      const response = await axios.post<RawGraduations>(url, query, AXIOS_CONFIG);
      if (response.status !== 200) {
        return new Error(`Failed to fetch raw graduations: ${response.statusText}`);
      }
      return response.data as RawGraduations;
    } catch (error) {
      return new Error(`Failed to fetch graduated pools: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}