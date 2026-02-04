import { PolymarketSailfishEventResource } from "./polymarket/types";

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
  RaydiumAmm = "RaydiumAmm",
  RaydiumCpmm = "RaydiumCpmm",
  RaydiumClmm = "RaydiumClmm",
  RaydiumLaunchpad = "RaydiumLaunchpad",
  PumpSwapAmm = "PumpSwapAmm",
  PumpFunAmm = "PumpFunAmm",
  MeteoraDyn = "MeteoraDyn",
  MeteoraDynV2 = "MeteoraDynV2",
  MeteoraDlmm = "MeteoraDlmm",
}

export type SailfishMessage = {
  type: SailfishEventType,
  resource: SailfishEventResource | PolymarketSailfishEventResource,
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
  token_0: string,
  token_1: string,
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

export enum CandleInterval {
  Seconds1 = "1s",
  Minutes1 = "1m",
  Hours1 = "1h",
  Days1 = "1d",
}

export type Candle = {
  open_time: string, // DateTime ISO string
  close_time: string, // DateTime ISO string
  open: string, // Decimal
  high: string, // Decimal
  low: string, // Decimal
  close: string, // Decimal
  volume: string, // Decimal
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

export type TradesQuery = {
  lower_tick: number,
  upper_tick: number,
  pool_types: PoolType[],
  pool_addresses: string[],
  token_addresses: string[],
  to_wallets: string[],
  from_wallets: string[],
}

export type CandlesQuery = {
  lower_tick: number,
  upper_tick: number,
  candle_interval: CandleInterval,
  pool_address: string,
}

export type CandlesResponse = {
  candles: Candle[],
}

export type GraduatedPoolsQuery = {
  lower_tick: number,
  upper_tick: number,
  pool_types: PoolType[],
  pool_addresses: string[],
  token_addresses: string[],
  // creator_addresses: string[],
}

export type IndexedPumpFunGraduatedPool = {
  created_at: Date,
  slot: number,
  version: string,
  first_signer: string,
  first_signature: string,
  all_signers: string[],
  all_signatures: string[],
  fee: number,
  priority_fee: number,
  index_in_slot: number,
  bribe: number,

  global: string,
  withdraw_authority: string,
  mint: string,
  bonding_curve: string,
  associated_bonding_curve: string,
  user: string,
  system_program: string,
  token_program: string,
  pump_amm: string,
  pool: string, // @dev this is the pool address on pumpswap for the new graduated pool.
  pool_authority: string,
  pool_authority_mint_account: string,
  pool_authority_wsol_account: string,
  amm_global_config: string,
  wsol_mint: string,
  lp_mint: string,
  user_pool_token_account: string,
  pool_base_token_account: string,
  pool_quote_token_account: string,
  token_2022_program: string,
  associated_token_program: string,
  pump_amm_event_authority: string,
  event_authority: string,
  program: string,
  coin_creator: string,
}


export type IndexedRaydiumLaunchpadMigrateToAmm = {
  created_at: Date,
  slot: number,
  version: string,
  first_signer: string,
  first_signature: string,
  all_signers: string[],
  all_signatures: string[],
  fee: number,
  priority_fee: number,
  index_in_slot: number,
  bribe: number,

  // Accounts
  payer: string,
  base_mint: string,
  quote_mint: string,
  openbook_program: string,
  market: string,
  request_queue: string,
  event_queue: string,
  bids: string,
  asks: string,
  market_vault_signer: string,
  market_base_vault: string,
  market_quote_vault: string,
  amm_program: string,
  amm_pool: string,
  amm_authority: string,
  amm_open_orders: string,
  amm_lp_mint: string,
  amm_base_vault: string,
  amm_quote_vault: string,
  amm_target_orders: string,
  amm_config: string,
  amm_create_fee_destination: string,
  authority: string,
  pool_state: string,
  global_config: string,
  base_vault: string,
  quote_vault: string,
  pool_lp_token: string,
  spl_token_program: string,
  associated_token_program: string,
  system_program: string,
  rent_program: string,

  // Data
  base_lot_size: number,
  quote_lot_size: number,
  market_vault_signer_nonce: number,
}


export type IndexedRaydiumLaunchpadMigrateToCpswap = {
  created_at: Date,
  slot: number,
  version: string,
  first_signer: string,
  first_signature: string,
  all_signers: string[],
  all_signatures: string[],
  fee: number,
  priority_fee: number,
  index_in_slot: number,
  bribe: number,

  // Accounts
  payer: string,
  base_mint: string,
  quote_mint: string,
  platform_config: string,
  cpswap_program: string,
  cpswap_pool: string,
  cpswap_authority: string,
  cpswap_lp_mint: string,
  cpswap_base_vault: string,
  cpswap_quote_vault: string,
  cpswap_config: string,
  cpswap_create_pool_fee: string,
  cpswap_observation: string,
  lock_program: string,
  lock_authority: string,
  lock_lp_vault: string,
  authority: string,
  pool_state: string,
  global_config: string,
  base_vault: string,
  quote_vault: string,
  pool_lp_token: string,
  base_token_program: string,
  quote_token_program: string,
  associated_token_program: string,
  system_program: string,
  rent_program: string,
  metadata_program: string,
}

export type RawGraduations = {
  pumpswap_graduations: IndexedPumpFunGraduatedPool[],
  raydium_amm_graduations: IndexedRaydiumLaunchpadMigrateToAmm[],
  raydium_cpmm_graduations: IndexedRaydiumLaunchpadMigrateToCpswap[],
}