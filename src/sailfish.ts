import {
  type TokenInfo,
  type PoolInfo,
  type Filter,
  type SailfishMessage,
  type TradeRaw,
  type SailfishCallbacks,
  type SailfishConfig,
  type FuzzyPoolInfoQuery,
  type TradesQuery,
  type Trade,
  type CandlesQuery,
  type CandlesResponse,
  type GraduatedPoolsQuery,
  type RawGraduations,
  SailfishEventResource,
  type PoolInit,
  PoolType,
  type TokenMint,
  type TokenInit,
} from "./types.js";

import { SailfishApi } from "./api.js";
import { SailfishWebsocket } from "./websocket.js";

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

export function getTradeData(poolInfo: PoolInfo, tradeRaw: TradeRaw): { quote_amount: string; base_amount: string; price: string } {
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

type SailfishInit = SailfishConfig & {
  filter?: Filter;
  callbacks?: SailfishCallbacks;
};

const DEFAULT_FILTER: Filter = {
  token_addresses: [],
  pool_addresses: [],
  dex_types: [],
};

export class Sailfish {
  private readonly config: SailfishConfig;

  private filter: Filter;
  private callbacks: SailfishCallbacks;

  private api: SailfishApi;
  private ws: SailfishWebsocket | null;

  private poolInfos: Record<string, PoolInfo>;
  private tokenInfos: Record<string, TokenInfo>;

  constructor({
    filter,
    callbacks,
    ...config
  }: SailfishInit) {
    this.config = config;

    this.filter = filter ?? DEFAULT_FILTER;
    this.callbacks = callbacks ?? {};

    this.api = new SailfishApi(config);
    this.ws = null;

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

    this.ws = new SailfishWebsocket({
      ...this.config,
      botName: "sailfish-ws",
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
      case SailfishEventResource.TokenInits:
        for (const tokenInit of message.data as TokenInit[]) {
          this.callbacks.onTokenInit?.(tokenInit);
        }
        break;
      case SailfishEventResource.TokenMints:
        for (const tokenMint of message.data as TokenMint[]) {
          this.callbacks.onTokenMint?.(tokenMint);
        }
        break;
      case SailfishEventResource.TokenGraduates:
        for (const poolInit of message.data as PoolInit[]) {
          this.callbacks.onTokenGraduate?.(poolInit);
        }
        break;
      case SailfishEventResource.PoolInits:
        for (const poolInit of message.data as PoolInit[]) {
          this.callbacks.onPoolInit?.(poolInit);
        }
        break;
      case SailfishEventResource.TradesRaw:
        for (const tradeRaw of message.data as TradeRaw[]) {
          this.callbacks.onTradeRaw?.(tradeRaw);
          if (this.callbacks.onTrade) {
            const trade = this.convertTradeRawToTrade(tradeRaw);
            if (trade !== null) {
              this.callbacks.onTrade(trade);
            }
          }
        }
        break;
      default:
        this.callbacks.onMessage?.(message);
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

  // --- REST API methods ---

  public async fetchLatestBlock(): Promise<number> {
    return this.api.fetchLatestBlock();
  }

  public async fetchPoolInfo(poolAddress: string): Promise<PoolInfo> {
    if (this.hasCachedPoolInfo(poolAddress)) {
      return this.poolInfos[poolAddress];
    }
    const poolInfo = await this.api.fetchPoolInfo(poolAddress);
    this.poolInfos[poolAddress] = poolInfo;
    return poolInfo;
  }

  public async fetchTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    if (this.hasCachedTokenInfo(tokenAddress)) {
      return this.tokenInfos[tokenAddress];
    }
    const tokenInfo = await this.api.fetchTokenInfo(tokenAddress);
    this.tokenInfos[tokenAddress] = tokenInfo;
    return tokenInfo;
  }

  public async fetchPoolInfoFuzzy(query: FuzzyPoolInfoQuery): Promise<PoolInfo[]> {
    return this.api.fetchPoolInfoFuzzy(query);
  }

  public async fetchTrades(query: TradesQuery): Promise<Record<string, Trade[]>> {
    return this.api.fetchTrades(query);
  }

  public async fetchCandles(query: CandlesQuery): Promise<CandlesResponse> {
    return this.api.fetchCandles(query);
  }

  public async fetchRawGraduations(query: GraduatedPoolsQuery): Promise<RawGraduations> {
    return this.api.fetchRawGraduations(query);
  }

  // --- Cache methods ---

  public hasCachedPoolInfo(poolAddress: string): boolean {
    return this.poolInfos[poolAddress] !== undefined;
  }

  public hasCachedTokenInfo(tokenAddress: string): boolean {
    return this.tokenInfos[tokenAddress] !== undefined;
  }

  public insertPoolInfo(poolInfo: PoolInfo) {
    this.poolInfos[poolInfo.address] = poolInfo;
  }

  public async buildPoolInfoFromPoolInit(
    poolInit: PoolInit,
    supportedQuoteTokens: string[] = DEFAULT_QUOTE_TOKEN_ADDRESSES,
  ): Promise<PoolInfo> {
    if (this.hasCachedPoolInfo(poolInit.pool_address)) {
      return this.poolInfos[poolInit.pool_address];
    }

    const [token0Info, token1Info] = await Promise.all([
      this.fetchTokenInfo(poolInit.token_0_mint),
      this.fetchTokenInfo(poolInit.token_1_mint),
    ]);

    const { quoteTokenInfo, baseTokenInfo } = getQuoteAndBaseTokenInfos(token0Info, token1Info, supportedQuoteTokens);
    return this.buildPoolInfo(poolInit.pool_type, poolInit.pool_address, quoteTokenInfo, baseTokenInfo);
  }

  public buildPoolInfo(
    poolType: PoolType,
    poolAddress: string,
    quoteTokenInfo: TokenInfo,
    baseTokenInfo: TokenInfo,
  ): PoolInfo {
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
