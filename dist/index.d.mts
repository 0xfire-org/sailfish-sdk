import { Method } from 'axios';

declare enum PolymarketSailfishEventResource {
    MarketOrdebooks = "market-ordebooks"
}
interface BookSide {
    levels: Record<string, string>;
}
interface SimpleMarket {
    market_slug: string;
    question: string;
    token_0: string;
    token_1: string;
    last_update_time: string;
}
interface Orderbook {
    bids: BookSide;
    asks: BookSide;
    tick_size: string;
}
interface MarketOrdebooks {
    orderbook_0: Orderbook;
    orderbook_1: Orderbook;
    market_slug: string;
    question: string;
    token_0: string;
    token_1: string;
    last_update_time: string;
}
type PolymarketSailfishCallbacks = {
    onMessage: (message: SailfishMessage) => void;
    onMarketOrdebooks: (message: MarketOrdebooks) => void;
};

type SailfishCallbacks = {
    onMessage: (message: SailfishMessage) => void;
    onTokenInit: (message: TokenInit) => void;
    onTokenMint: (message: TokenMint) => void;
    onTokenGraduate: (message: PoolInit) => void;
    onPoolInit: (poolInit: PoolInit) => void;
    onTradeRaw: (tradeRaw: TradeRaw) => void;
    onTrade: (trade: Trade) => void;
};
declare enum SailfishEventType {
    Event = "event",
    Signal = "signal"
}
declare enum SailfishEventResource {
    TokenInits = "token-inits",
    TokenMints = "token-mints",
    TokenGraduates = "token-graduates",
    PoolInits = "pool-inits",
    PoolGraduates = "pool-graduates",
    TradesRaw = "trades-raw"
}
declare enum PoolType {
    RaydiumAmm = "RaydiumAmm",
    RaydiumCpmm = "RaydiumCpmm",
    RaydiumClmm = "RaydiumClmm",
    RaydiumLaunchpad = "RaydiumLaunchpad",
    PumpSwapAmm = "PumpSwapAmm",
    PumpFunAmm = "PumpFunAmm",
    MeteoraDyn = "MeteoraDyn",
    MeteoraDynV2 = "MeteoraDynV2",
    MeteoraDlmm = "MeteoraDlmm"
}
type SailfishMessage = {
    type: SailfishEventType;
    resource: SailfishEventResource | PolymarketSailfishEventResource;
    data: any;
};
interface Filter {
    token_addresses: string[];
    pool_addresses: string[];
    dex_types: string[];
}
type TokenInfo = {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    total_supply: string;
};
type PoolInfo = {
    pool_type: PoolType;
    address: string;
    quote_token: TokenInfo;
    base_token: TokenInfo;
    buy_path: string[];
    sell_path: string[];
    token_0: string;
    token_1: string;
};
type TradeIndex = {
    tick: number;
    index_a: number;
    index_b: number;
    tx_hash: string;
};
type Trade = {
    index: TradeIndex;
    pool_address: string;
    quote_token_address: string;
    base_token_address: string;
    quote_amount: string;
    base_amount: string;
    price: string;
    fee: string;
    bribe: string;
    from_wallet: string;
    to_wallet: string;
    from_wallet_account: string | null;
    to_wallet_account: string | null;
};
type TradeRaw = {
    index: TradeIndex;
    pool_type: string;
    pool_address: string;
    token_address_in: string;
    token_amount_in: string;
    token_address_out: string;
    token_amount_out: string;
    price: string;
    fee: string;
    bribe: string;
    to_wallet: string;
    from_wallet: string;
    from_account: string;
    to_account: string;
};
type SolTxData = {
    slot: number;
    version: string;
    first_signer: string;
    first_signature: string;
    all_signers: string[];
    all_signatures: string[];
    fee: number;
    bribe: number;
    priority_fee: number | null;
    index_in_slot: number | null;
};
type InstructionPosition = {
    parent_index: number;
    child_index: number | null;
};
type PoolInit = {
    tx: SolTxData;
    pool_type: PoolType;
    pool_address: string;
    token_0_mint: string;
    token_1_mint: string;
};
type TokenInit = {
    tx: SolTxData;
    instruction_position: InstructionPosition;
    program_id: string;
    decimals: number;
    mint: string;
    mint_authority: string | null;
};
type TokenMint = {
    tx: SolTxData;
    instruction_position: InstructionPosition;
    program_id: string;
    account: string;
    amount: string;
    mint: string;
    mint_authority: string | null;
};
type TradesQuery = {
    lower_tick: number;
    upper_tick: number;
    pool_types: PoolType[];
    pool_addresses: string[];
    token_addresses: string[];
    to_wallets: string[];
    from_wallets: string[];
};
type GraduatedPoolsQuery = {
    lower_tick: number;
    upper_tick: number;
    pool_types: PoolType[];
    pool_addresses: string[];
    token_addresses: string[];
};
type IndexedPumpFunGraduatedPool = {
    created_at: Date;
    slot: number;
    version: string;
    first_signer: string;
    first_signature: string;
    all_signers: string[];
    all_signatures: string[];
    fee: number;
    priority_fee: number;
    index_in_slot: number;
    bribe: number;
    global: string;
    withdraw_authority: string;
    mint: string;
    bonding_curve: string;
    associated_bonding_curve: string;
    user: string;
    system_program: string;
    token_program: string;
    pump_amm: string;
    pool: string;
    pool_authority: string;
    pool_authority_mint_account: string;
    pool_authority_wsol_account: string;
    amm_global_config: string;
    wsol_mint: string;
    lp_mint: string;
    user_pool_token_account: string;
    pool_base_token_account: string;
    pool_quote_token_account: string;
    token_2022_program: string;
    associated_token_program: string;
    pump_amm_event_authority: string;
    event_authority: string;
    program: string;
    coin_creator: string;
};
type IndexedRaydiumLaunchpadMigrateToAmm = {
    created_at: Date;
    slot: number;
    version: string;
    first_signer: string;
    first_signature: string;
    all_signers: string[];
    all_signatures: string[];
    fee: number;
    priority_fee: number;
    index_in_slot: number;
    bribe: number;
    payer: string;
    base_mint: string;
    quote_mint: string;
    openbook_program: string;
    market: string;
    request_queue: string;
    event_queue: string;
    bids: string;
    asks: string;
    market_vault_signer: string;
    market_base_vault: string;
    market_quote_vault: string;
    amm_program: string;
    amm_pool: string;
    amm_authority: string;
    amm_open_orders: string;
    amm_lp_mint: string;
    amm_base_vault: string;
    amm_quote_vault: string;
    amm_target_orders: string;
    amm_config: string;
    amm_create_fee_destination: string;
    authority: string;
    pool_state: string;
    global_config: string;
    base_vault: string;
    quote_vault: string;
    pool_lp_token: string;
    spl_token_program: string;
    associated_token_program: string;
    system_program: string;
    rent_program: string;
    base_lot_size: number;
    quote_lot_size: number;
    market_vault_signer_nonce: number;
};
type IndexedRaydiumLaunchpadMigrateToCpswap = {
    created_at: Date;
    slot: number;
    version: string;
    first_signer: string;
    first_signature: string;
    all_signers: string[];
    all_signatures: string[];
    fee: number;
    priority_fee: number;
    index_in_slot: number;
    bribe: number;
    payer: string;
    base_mint: string;
    quote_mint: string;
    platform_config: string;
    cpswap_program: string;
    cpswap_pool: string;
    cpswap_authority: string;
    cpswap_lp_mint: string;
    cpswap_base_vault: string;
    cpswap_quote_vault: string;
    cpswap_config: string;
    cpswap_create_pool_fee: string;
    cpswap_observation: string;
    lock_program: string;
    lock_authority: string;
    lock_lp_vault: string;
    authority: string;
    pool_state: string;
    global_config: string;
    base_vault: string;
    quote_vault: string;
    pool_lp_token: string;
    base_token_program: string;
    quote_token_program: string;
    associated_token_program: string;
    system_program: string;
    rent_program: string;
    metadata_program: string;
};
type RawGraduations = {
    pumpswap_graduations: IndexedPumpFunGraduatedPool[];
    raydium_amm_graduations: IndexedRaydiumLaunchpadMigrateToAmm[];
    raydium_cpmm_graduations: IndexedRaydiumLaunchpadMigrateToCpswap[];
};

type SailfishTierDemo = {
    type: "demo";
    apiKey: string;
};
type SailfishTierFree = {
    type: "free";
    apiKey: string;
};
type SailfishTierBasic = {
    type: "basic";
    apiKey: string;
};
type PolymarketTier = {
    type: "polymarket";
    apiKey: string;
};
type SailfishTierType = SailfishTier['type'];
type AuthHeaders = Record<string, string>;
type SailfishTier = SailfishTierDemo | SailfishTierFree | SailfishTierBasic | PolymarketTier;
declare const SailfishTier: {
    is(value: unknown): value is SailfishTier;
    demo({ apiKey }: {
        apiKey: string;
    }): SailfishTierDemo;
    free({ apiKey }: {
        apiKey: string;
    }): SailfishTierFree;
    basic({ apiKey }: {
        apiKey: string;
    }): SailfishTierBasic;
    isDemo(value: unknown): value is SailfishTierDemo;
    isFree(value: unknown): value is SailfishTierFree;
    isBasic(value: unknown): value is SailfishTierBasic;
    isPolymarket(value: unknown): value is PolymarketTier;
    wsBaseUrl(tier: SailfishTier): {
        baseUrl: string;
        authHeaders: AuthHeaders;
    };
    httpBaseUrl(tier: SailfishTier): {
        baseUrl: string;
        authHeaders: AuthHeaders;
    };
};

declare class SailfishApi {
    private readonly tier;
    private readonly baseUrl;
    private readonly authHeaders;
    constructor({ tier }: {
        tier: SailfishTier;
    });
    fetchLatestBlock(): Promise<number>;
    fetchPoolInfo(address: string): Promise<PoolInfo>;
    fetchTokenInfo(address: string): Promise<TokenInfo>;
    fetchTrades(query: TradesQuery): Promise<Record<string, Trade[]>>;
    fetchRawGraduations(query: GraduatedPoolsQuery): Promise<RawGraduations>;
    httpRequest<ReqData, ResData>(method: Method, path: string, data?: ReqData): Promise<ResData>;
}

declare const DEFAULT_QUOTE_TOKEN_ADDRESSES: string[];
declare const BONDING_CURVE_POOL_TYPES: PoolType[];
declare function amountToFloatString(amount: string | number, decimals: number): string;
declare function getTradeData(poolInfo: PoolInfo, tradeRaw: TradeRaw): any;
declare function getQuoteAndBaseTokenInfos(token0Info: TokenInfo, token1Info: TokenInfo, supportedQuoteTokens?: string[]): {
    quoteTokenInfo: TokenInfo;
    baseTokenInfo: TokenInfo;
};
type SailfishInit = {
    filter: Filter;
    callbacks: SailfishCallbacks;
    tier: SailfishTier;
};
declare class Sailfish {
    private tier;
    private filter;
    private callbacks;
    private api;
    private ws;
    private poolInfos;
    private tokenInfos;
    constructor({ tier, filter, callbacks, }: SailfishInit);
    isRunning(): boolean;
    swim(): void;
    rest(): void;
    onMessage(message: SailfishMessage): void;
    convertTradeRawToTrade(tradeRaw: TradeRaw): Trade | null;
    updateFilter(filter: Filter): void;
    hasCachedPoolInfo(poolAddress: string): boolean;
    hasCachedTokenInfo(tokenAddress: string): boolean;
    fetchPoolInfo(poolAddress: string): Promise<PoolInfo | Error>;
    fetchTokenInfo(tokenAddress: string): Promise<TokenInfo | Error>;
    insertPoolInfo(poolInfo: PoolInfo): void;
    buildPoolInfoFromPoolInit(poolInit: PoolInit, supportedQuoteTokens?: string[]): Promise<PoolInfo | Error>;
    buildPoolInfo(poolType: PoolType, poolAddress: string, quoteTokenInfo: TokenInfo, baseTokenInfo: TokenInfo): Promise<PoolInfo | Error>;
    getPoolInfo(poolAddress: string): PoolInfo | null;
    getTokenInfo(tokenAddress: string): TokenInfo | null;
    getAllPools(): Record<string, PoolInfo>;
    getAllTokens(): Record<string, TokenInfo>;
    getFilter(): Filter;
}

declare class SailfishWebsocket {
    readonly botName: string;
    enabled: boolean;
    connecting: boolean;
    connected: boolean;
    private readonly tier;
    private readonly baseUrl;
    private readonly authHeaders;
    private filter;
    private callback;
    private socket;
    private reconnectAttempts;
    private reconnecting;
    private readonly maxReconnects;
    private readonly reconnectDelay;
    constructor({ tier, botName, filter, callback, }: {
        tier: SailfishTier;
        botName: string;
        filter: Filter;
        callback: (message: SailfishMessage) => void;
    });
    updateFilter(newFilter: Filter): void;
    private _start;
    private onOpen;
    private onMessage;
    private onClose;
    private onError;
    private scheduleReconnect;
    stop(): void;
    send(data: string | object): void;
}

type PolymarketSailfishInit = {
    filter: any;
    callbacks: PolymarketSailfishCallbacks;
};
declare class PolymarketSailfish {
    private filter;
    private callbacks;
    private ws;
    private markets;
    private orderbooks;
    constructor({ filter, callbacks, }: PolymarketSailfishInit);
    isRunning(): boolean;
    swim(): void;
    rest(): void;
    onMessage(message: SailfishMessage): void;
    getMarkets(): Record<string, SimpleMarket>;
    getOrderbook(marketSlug: string): MarketOrdebooks | null;
}

export { type AuthHeaders, BONDING_CURVE_POOL_TYPES, type BookSide, DEFAULT_QUOTE_TOKEN_ADDRESSES, type Filter, type GraduatedPoolsQuery, type IndexedPumpFunGraduatedPool, type IndexedRaydiumLaunchpadMigrateToAmm, type IndexedRaydiumLaunchpadMigrateToCpswap, type InstructionPosition, type MarketOrdebooks, type Orderbook, PolymarketSailfish, type PolymarketSailfishCallbacks, PolymarketSailfishEventResource, type PolymarketTier, type PoolInfo, type PoolInit, PoolType, type RawGraduations, Sailfish, SailfishApi, type SailfishCallbacks, SailfishEventResource, SailfishEventType, type SailfishMessage, SailfishTier, type SailfishTierBasic, type SailfishTierDemo, type SailfishTierFree, type SailfishTierType, SailfishWebsocket, type SimpleMarket, type SolTxData, type TokenInfo, type TokenInit, type TokenMint, type Trade, type TradeIndex, type TradeRaw, type TradesQuery, amountToFloatString, getQuoteAndBaseTokenInfos, getTradeData };
