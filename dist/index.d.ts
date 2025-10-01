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
    UniswapV2 = "UniswapV2",
    UniswapV3 = "UniswapV3",
    RaydiumAmm = "RaydiumAmm",
    RaydiumCpmm = "RaydiumCpmm",
    RaydiumClmm = "RaydiumClmm",
    RadiumLaunchpad = "RadiumLaunchpad",
    PumpSwapAmm = "PumpSwapAmm",
    PumpFunAmm = "PumpFunAmm",
    MeteoraDyn = "MeteoraDyn",
    MeteoraDynV2 = "MeteoraDynV2",
    AerodromeV2 = "AerodromeV2",
    AerodromeV3 = "AerodromeV3"
}
type SailfishMessage = {
    type: SailfishEventType;
    resource: SailfishEventResource;
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

declare class SailfishApi {
    private baseUrl;
    constructor(baseUrl?: string);
    fetchPoolInfo(address: string): Promise<PoolInfo | Error>;
    fetchTokenInfo(address: string): Promise<TokenInfo | Error>;
}

declare const DEFAULT_QUOTE_TOKEN_ADDRESSES: string[];
declare const BONDING_CURVE_POOL_TYPES: PoolType[];
declare function amountToFloatString(amount: string | number, decimals: number): string;
declare function getTradeData(poolInfo: PoolInfo, tradeRaw: TradeRaw): any;
declare function getQuoteAndBaseTokenInfos(token0Info: TokenInfo, token1Info: TokenInfo, supportedQuoteTokens?: string[]): {
    quoteTokenInfo: TokenInfo;
    baseTokenInfo: TokenInfo;
};
declare class Sailfish {
    private filter;
    private ws;
    private api;
    private poolInfos;
    private tokenInfos;
    private callbacks;
    constructor(callbacks: SailfishCallbacks, filter: Filter, apiUrl?: string, wsUrl?: string);
    onMessage(message: SailfishMessage): void;
    convertTradeRawToTrade(tradeRaw: TradeRaw): Trade | null;
    updateFilter(filter: Filter): void;
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
    private socket;
    private reconnectAttempts;
    private reconnecting;
    private readonly maxReconnects;
    private readonly reconnectDelay;
    readonly botName: string;
    readonly ws_url: string;
    enabled: boolean;
    connecting: boolean;
    connected: boolean;
    private callback;
    private filter;
    constructor(ws_url: string, botName: string, filter: Filter, callback: (message: SailfishMessage) => void);
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

declare const PRODUCTION_API_URL = "https://sailfish.0xfire.com:1100";
declare const PRODUCTION_WS_URL = "wss://sailfish.0xfire.com:30399/public/ws";

export { BONDING_CURVE_POOL_TYPES, DEFAULT_QUOTE_TOKEN_ADDRESSES, type Filter, type InstructionPosition, PRODUCTION_API_URL, PRODUCTION_WS_URL, type PoolInfo, type PoolInit, PoolType, Sailfish, SailfishApi, type SailfishCallbacks, SailfishEventResource, SailfishEventType, type SailfishMessage, SailfishWebsocket, type SolTxData, type TokenInfo, type TokenInit, type TokenMint, type Trade, type TradeIndex, type TradeRaw, amountToFloatString, getQuoteAndBaseTokenInfos, getTradeData };
