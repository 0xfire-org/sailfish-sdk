export type SailfishCallbacks = {
  onMessage: (message: SailfishMessage) => void;
  onTokenInit: (message: TokenInit) => void;
  onTokenMint: (message: TokenMint) => void;
  onTokenGraduate: (message: PoolInit) => void;
  onPoolInit: (poolInit: PoolInit) => void;
  onTradeRaw: (tradeRaw: TradeRaw) => void;
  onTrade: (trade: Trade) => void;
}

export enum SailfishEventType {
  Event = "event",
  Signal = "signal",
}

export enum SailfishEventResource {
  TokenInits = "token-inits",
  TokenMints = "token-mints",
  TokenGraduates = "token-graduates",
  PoolInits = "pool-inits",
  PoolGraduates = "pool-graduates",
  TradesRaw = "trades-raw",
}

export enum PoolType {
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
  AerodromeV3 = "AerodromeV3",
}

export type SailfishMessage = {
  type: SailfishEventType,
  resource: SailfishEventResource,
  data: any,
}

export interface Filter {
  token_addresses: string[];
  pool_addresses: string[];
  dex_types: string[];
}

export type TokenInfo = {
  address: string,
  name: string,
  symbol: string,
  decimals: number,
  total_supply: string,
}

export type PoolInfo = {
  pool_type: PoolType,
  address: string,
  quote_token: TokenInfo,
  base_token: TokenInfo,
  buy_path: string[],
  sell_path: string[],
}

export type TradeIndex = {
  tick: number, // @dev - This is usually the block/slot number of the trade.
  index_a: number, // @dev - This is usually the index of the trade in within the tick. Think of it as the tx index.
  index_b: number, // @dev - This is usually the index of the trade within the tx. Remember one tx can have multiple trades.
  tx_hash: string, // @dev - This is the hash of the transaction that the trade occurred in.
}

export type Trade = {
  index: TradeIndex,

  pool_address: string, // @dev - This is the address of the pool that the trade occurred in.
  quote_token_address: string, // @dev - This is the address of the quote token.
  base_token_address: string, // @dev - This is the address of the base token.

  quote_amount: string, // @dev - This is the signed amount of the quote token change. Quote token is usually WSOL/SOL/ETH/WETH. Could also be USDC/USDT/etc.
  base_amount: string, // @dev - This is the signed amount of the base token change. Base token is usually the token being traded.

  price: string, // @dev - This is the price of the trade base_token/quote_token.
  fee: string, // @dev - This is the fee usually in ETH/SOL that was paid for the trade.
  bribe: string, // @dev - This is the bribe usually in ETH/SOL that was paid for the trade.

  from_wallet: string, // @dev - This is the wallet address of the trader that made the trade.
  to_wallet: string, // @dev - This is the wallet address of the trader that received the trade.

  from_wallet_account: string | null, // @dev - This is the wallet account of the trader that made the trade, applies only to Solana.
  to_wallet_account: string | null, // @dev - This is the wallet account of the trader that received the trade, applies only to Solana.
}

export type TradeRaw = {
  index: TradeIndex,

  pool_type: string,
  pool_address: string,

  token_address_in: string,
  token_amount_in: string,

  token_address_out: string,
  token_amount_out: string,

  price: string,
  fee: string,
  bribe: string,

  to_wallet: string,
  from_wallet: string,

  from_account: string,
  to_account: string,
}

export type SolTxData = {
  slot: number,
  version: string,
  first_signer: string,
  first_signature: string,
  all_signers: string[],
  all_signatures: string[],
  fee: number,
  bribe: number,
  priority_fee: number | null,
  index_in_slot: number | null,
}

export type InstructionPosition = {
  parent_index: number,
  child_index: number | null,
}

export type PoolInit = {
  tx: SolTxData,
  pool_type: PoolType,
  pool_address: string,
  token_0_mint: string,
  token_1_mint: string,
}

export type TokenInit = {
  tx: SolTxData,
  instruction_position: InstructionPosition,
  program_id: string,
  decimals: number,
  mint: string,
  mint_authority: string | null,
}

export type TokenMint = {
  tx: SolTxData,
  instruction_position: InstructionPosition,
  program_id: string,
  account: string,
  amount: string,
  mint: string,
  mint_authority: string | null,
}