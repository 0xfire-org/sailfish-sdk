import {
  type TokenInfo,
  type PoolInfo,
  type Filter,
  type SailfishMessage,
  type TradeRaw,
  type SailfishCallbacks,
  SailfishEventResource,
  type Trade,
  type PoolInit,
  PoolType,
  type TokenMint,
  type TokenInit,
} from "./types";

import { SailfishApi } from "./api";
import { SailfishWebsocket } from "./websocket";
import { PRODUCTION_WS_URL, PRODUCTION_API_URL } from "./constants";

export const DEFAULT_QUOTE_TOKEN_ADDRESSES: string[] = [
  "11111111111111111111111111111111", // SOL
  "So11111111111111111111111111111111111111112", // WSOL
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
  "USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB", // USD1
];

export const BONDING_CURVE_POOL_TYPES: PoolType[] = [
  PoolType.PumpFunAmm,
  PoolType.RaydiumLaunchpad,
];

export function amountToFloatString(amount: string | number, decimals: number): string {
  if (amount === null || amount === undefined) {
    console.error("amountToFloatString received undefined/null amount");
    return "0";
  }

  const amountStr = String(amount);

  const padded = amountStr.padStart(decimals + 1, "0");
  const integerPart = padded.slice(0, padded.length - decimals) || "0";
  const fractionalPart = padded.slice(padded.length - decimals);

  return `${integerPart}.${fractionalPart}`;
}

export function getTradeData(poolInfo: PoolInfo, tradeRaw: TradeRaw): any {
  let quoteAmount = "0";
  let baseAmount = "0";
  let price = "0";

  if (poolInfo.quote_token.address.toLowerCase() === tradeRaw.token_address_in.toLowerCase()) {
    // This is a buy trade.
    quoteAmount = `-${amountToFloatString(tradeRaw.token_amount_in, poolInfo.quote_token.decimals)}`;
    baseAmount = amountToFloatString(tradeRaw.token_amount_out, poolInfo.base_token.decimals);
  } else {
    // This is a sell trade.
    quoteAmount = amountToFloatString(tradeRaw.token_amount_out, poolInfo.quote_token.decimals);
    baseAmount = `-${amountToFloatString(tradeRaw.token_amount_in, poolInfo.base_token.decimals)}`;
  }

  price = (Math.abs(parseFloat(quoteAmount)) / Math.abs(parseFloat(baseAmount))).toString();

  return {
    quote_amount: quoteAmount,
    base_amount: baseAmount,
    price: price,
  }
}

export function getQuoteAndBaseTokenInfos(token0Info: TokenInfo, token1Info: TokenInfo, supportedQuoteTokens: string[] = DEFAULT_QUOTE_TOKEN_ADDRESSES): { quoteTokenInfo: TokenInfo, baseTokenInfo: TokenInfo } {
  if (supportedQuoteTokens.includes(token0Info.address)) {
    return { quoteTokenInfo: token0Info, baseTokenInfo: token1Info };
  }
  if (supportedQuoteTokens.includes(token1Info.address)) {
    return { quoteTokenInfo: token1Info, baseTokenInfo: token0Info };
  }
  throw new Error(`No supported quote token found for ${token0Info.address} and ${token1Info.address}`);
}

export class Sailfish {
  private filter: Filter;
  private wsUrl: string;
  private ws: SailfishWebsocket | null = null;
  private api: SailfishApi;
  private poolInfos: Record<string, PoolInfo>;
  private tokenInfos: Record<string, TokenInfo>;
  private callbacks: SailfishCallbacks;

  constructor(
    callbacks: SailfishCallbacks,
    filter: Filter,
    apiUrl: string = PRODUCTION_API_URL,
    wsUrl: string = PRODUCTION_WS_URL,
  ) {
    this.api = new SailfishApi(apiUrl);
    this.callbacks = callbacks;
    this.filter = filter;
    this.wsUrl = wsUrl;
    this.poolInfos = {};
    this.tokenInfos = {};
  }

  public isRunning(): boolean {
    return this.ws !== null && this.ws.connected;
  }

  public swim() {
    if (this.ws !== null) {
      return;
    }

    this.ws = new SailfishWebsocket(
      this.wsUrl,
      "sailfish-ws",
      this.filter,
      (message: SailfishMessage) => { this.onMessage(message) },
    );
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
      case SailfishEventResource.TokenInits:
        for (const tokenInit of message.data as TokenInit[]) {
          this.callbacks.onTokenInit(tokenInit);
        }
        break;
      case SailfishEventResource.TokenMints:
        for (const tokenMint of message.data as TokenMint[]) {
          this.callbacks.onTokenMint(tokenMint);
        }
        break;
      case SailfishEventResource.TokenGraduates:
        for (const poolInit of message.data as PoolInit[]) {
          this.callbacks.onTokenGraduate(poolInit);
        }
        break;
      case SailfishEventResource.PoolInits:
        for (const poolInit of message.data as PoolInit[]) {
          this.callbacks.onPoolInit(poolInit);
        }
        break;
      case SailfishEventResource.TradesRaw:
        const tradesRaw = message.data as TradeRaw[];
        for (const tradeRaw of tradesRaw) {
          this.callbacks.onTradeRaw(tradeRaw);
          const trade = this.convertTradeRawToTrade(tradeRaw);
          if (trade !== null) {
            this.callbacks.onTrade(trade);
          }
        }
        break;
      default:
        this.callbacks.onMessage(message);
        break;
    }
  }

  public convertTradeRawToTrade(tradeRaw: TradeRaw): Trade | null {
    const poolInfo = this.getPoolInfo(tradeRaw.pool_address);
    if (poolInfo === null) {
      return null;
    }

    const tradeData = getTradeData(poolInfo, tradeRaw);

    const trade: Trade = {
      index: tradeRaw.index,
      pool_address: tradeRaw.pool_address,
      quote_token_address: poolInfo.quote_token.address,
      base_token_address: poolInfo.base_token.address,
      quote_amount: tradeData.quote_amount,
      base_amount: tradeData.base_amount,
      price: tradeData.price,
      fee: tradeRaw.fee,
      bribe: tradeRaw.bribe,
      from_wallet: tradeRaw.from_wallet,
      to_wallet: tradeRaw.to_wallet,
      from_wallet_account: tradeRaw.from_account,
      to_wallet_account: tradeRaw.to_account,
    };

    return trade;
  }

  public updateFilter(filter: Filter) {
    this.filter = filter;
    if (this.ws !== null) {
      this.ws.updateFilter(filter);
    }
  }

  public hasCachedPoolInfo(poolAddress: string): boolean {
    return this.poolInfos[poolAddress] !== undefined;
  }

  public hasCachedTokenInfo(tokenAddress: string): boolean {
    return this.tokenInfos[tokenAddress] !== undefined;
  }

  public async fetchPoolInfo(poolAddress: string): Promise<PoolInfo | Error> {
    if (this.hasCachedPoolInfo(poolAddress)) {
      return this.poolInfos[poolAddress];
    }

    try {
      const newPoolInfo = await this.api.fetchPoolInfo(poolAddress);
      if (newPoolInfo instanceof Error) {
        return newPoolInfo;
      }
      this.poolInfos[poolAddress] = newPoolInfo;
      return newPoolInfo;
    } catch (error) {
      return new Error(`Failed to fetch pool info: ${error}, use buildPoolInfo instead for ${BONDING_CURVE_POOL_TYPES.join(", ")} pools`);
    }
  }

  public async fetchTokenInfo(tokenAddress: string): Promise<TokenInfo | Error> {
    if (this.hasCachedTokenInfo(tokenAddress)) {
      return this.tokenInfos[tokenAddress];
    }

    try {
      const newTokenInfo = await this.api.fetchTokenInfo(tokenAddress);
      if (newTokenInfo instanceof Error) {
        return newTokenInfo;
      }
      this.tokenInfos[tokenAddress] = newTokenInfo;
      return newTokenInfo;
    } catch (error) {
      return new Error(`Failed to fetch token info: ${error}`);
    }
  }

  public insertPoolInfo(poolInfo: PoolInfo) {
    this.poolInfos[poolInfo.address] = poolInfo;
  }

  public async buildPoolInfoFromPoolInit(
    poolInit: PoolInit,
    supportedQuoteTokens: string[] = DEFAULT_QUOTE_TOKEN_ADDRESSES,
  ): Promise<PoolInfo | Error> {
    if (this.hasCachedPoolInfo(poolInit.pool_address)) {
      return this.poolInfos[poolInit.pool_address];
    }

    const token0Info = await this.fetchTokenInfo(poolInit.token_0_mint);
    const token1Info = await this.fetchTokenInfo(poolInit.token_1_mint);
    if (token0Info instanceof Error || token1Info instanceof Error) {
      return new Error(`Failed to build pool info from pool init: ${token0Info} or ${token1Info}`);
    }

    const { quoteTokenInfo, baseTokenInfo } = getQuoteAndBaseTokenInfos(token0Info, token1Info, supportedQuoteTokens);
    const poolInfo = await this.buildPoolInfo(poolInit.pool_type, poolInit.pool_address, quoteTokenInfo, baseTokenInfo);
    if (poolInfo instanceof Error) {
      return new Error(`Failed to build pool info from pool init: ${poolInfo}`);
    }

    return poolInfo;
  }

  public async buildPoolInfo(
    poolType: PoolType,
    poolAddress: string,
    quoteTokenInfo: TokenInfo,
    baseTokenInfo: TokenInfo,
  ): Promise<PoolInfo | Error> {
    const poolInfo: PoolInfo = {
      pool_type: poolType,
      address: poolAddress,
      quote_token: quoteTokenInfo,
      base_token: baseTokenInfo,
      buy_path: [
        quoteTokenInfo.address,
        baseTokenInfo.address,
      ],
      sell_path: [
        baseTokenInfo.address,
        quoteTokenInfo.address,
      ],
      token_0: quoteTokenInfo.address,
      token_1: baseTokenInfo.address,
    };

    return poolInfo;
  }

  public getPoolInfo(poolAddress: string): PoolInfo | null {
    return this.poolInfos[poolAddress] ?? null;
  }

  public getTokenInfo(tokenAddress: string): TokenInfo | null {
    return this.tokenInfos[tokenAddress] ?? null;
  }

  public getAllPools(): Record<string, PoolInfo> {
    return this.poolInfos;
  }

  public getAllTokens(): Record<string, TokenInfo> {
    return this.tokenInfos;
  }

  public getFilter(): Filter {
    return this.filter;
  }

}