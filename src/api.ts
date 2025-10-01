import axios from "axios";
import type { PoolInfo, TokenInfo } from "./types";
import { PRODUCTION_API_URL } from "./constants";

const HEADERS = { headers: { "Content-Type": "application/json" } };
export class SailfishApi {
  private baseUrl: string;
  constructor(
    baseUrl: string = PRODUCTION_API_URL,
  ) {
    this.baseUrl = baseUrl;
  }

  public async fetchPoolInfo(address: string): Promise<PoolInfo | Error> {
    const url = `${this.baseUrl}/pools/info`;
    const response = await axios.post<PoolInfo>(url, address, HEADERS);
    if (response.status !== 200) {
      return new Error(`Failed to fetch pool info: ${response.statusText}`);
    }
    return response.data;
  }

  public async fetchTokenInfo(address: string): Promise<TokenInfo | Error> {
    const url = `${this.baseUrl}/tokens/info`;
    const response = await axios.post<TokenInfo>(url, address, HEADERS);
    if (response.status !== 200) {
      return new Error(`Failed to fetch token info: ${response.statusText}`);
    }
    return response.data;
  }

}