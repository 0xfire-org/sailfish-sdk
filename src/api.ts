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

  private _valid_block_range(from_block: number, to_block: number, max_range: number = 1000): Error | true {
    if (from_block >= to_block) {
      return new Error("from_block must be less than to_block");
    }
    if (from_block < 0) {
      return new Error("from_block must be greater than 0");
    }
    if (to_block < 0) {
      return new Error("to_block must be greater than 0");
    }

    const range = to_block - from_block;
    if (range > max_range) {
      return new Error(`block range must be less or equal to ${max_range} blocks`);
    }

    return true as const;
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
    const url = `${this.baseUrl}/pools/info`;
    const response = await axios.post<PoolInfo>(url, address, AXIOS_CONFIG);
    if (response.status !== 200) {
      return new Error(`Failed to fetch pool info: ${response.statusText}`);
    }
    return response.data;
  }

  public async fetchTokenInfo(address: string): Promise<TokenInfo | Error> {
    const url = `${this.baseUrl}/tokens/info`;
    const response = await axios.post<TokenInfo>(url, address, AXIOS_CONFIG);
    if (response.status !== 200) {
      return new Error(`Failed to fetch token info: ${response.statusText}`);
    }
    return response.data;
  }

  public async fetchTrades(query: TradesQuery): Promise<Record<string, Trade[]> | Error> {
    const validation_error = this._valid_block_range(query.from_block, query.to_block);
    if (validation_error instanceof Error) {
      return validation_error;
    }

    const url = `${this.baseUrl}/trades`;
    const response = await axios.post<Record<string, Trade[]>>(url, query, AXIOS_CONFIG);
    if (response.status !== 200) {
      return new Error(`Failed to fetch trades: ${response.statusText}`);
    }
    return response.data as Record<string, Trade[]>;
  }

  public async fetchRawGraduations(query: GraduatedPoolsQuery): Promise<RawGraduations | Error> {
    const validation_error = this._valid_block_range(query.from_block, query.to_block, 100_000);
    if (validation_error instanceof Error) {
      return validation_error;
    }

    const url = `${this.baseUrl}/graduations/raw`;
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