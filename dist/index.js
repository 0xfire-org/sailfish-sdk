"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  BONDING_CURVE_POOL_TYPES: () => BONDING_CURVE_POOL_TYPES,
  DEFAULT_QUOTE_TOKEN_ADDRESSES: () => DEFAULT_QUOTE_TOKEN_ADDRESSES,
  PolymarketSailfish: () => PolymarketSailfish,
  PolymarketSailfishEventResource: () => PolymarketSailfishEventResource,
  PoolType: () => PoolType,
  Sailfish: () => Sailfish,
  SailfishApi: () => SailfishApi,
  SailfishEventResource: () => SailfishEventResource,
  SailfishEventType: () => SailfishEventType,
  SailfishTier: () => SailfishTier,
  SailfishWebsocket: () => SailfishWebsocket,
  amountToFloatString: () => amountToFloatString,
  getQuoteAndBaseTokenInfos: () => getQuoteAndBaseTokenInfos,
  getTradeData: () => getTradeData
});
module.exports = __toCommonJS(index_exports);

// src/types.ts
var SailfishEventType = /* @__PURE__ */ ((SailfishEventType2) => {
  SailfishEventType2["Event"] = "event";
  SailfishEventType2["Signal"] = "signal";
  return SailfishEventType2;
})(SailfishEventType || {});
var SailfishEventResource = /* @__PURE__ */ ((SailfishEventResource2) => {
  SailfishEventResource2["TokenInits"] = "token-inits";
  SailfishEventResource2["TokenMints"] = "token-mints";
  SailfishEventResource2["TokenGraduates"] = "token-graduates";
  SailfishEventResource2["PoolInits"] = "pool-inits";
  SailfishEventResource2["PoolGraduates"] = "pool-graduates";
  SailfishEventResource2["TradesRaw"] = "trades-raw";
  return SailfishEventResource2;
})(SailfishEventResource || {});
var PoolType = /* @__PURE__ */ ((PoolType2) => {
  PoolType2["RaydiumAmm"] = "RaydiumAmm";
  PoolType2["RaydiumCpmm"] = "RaydiumCpmm";
  PoolType2["RaydiumClmm"] = "RaydiumClmm";
  PoolType2["RaydiumLaunchpad"] = "RaydiumLaunchpad";
  PoolType2["PumpSwapAmm"] = "PumpSwapAmm";
  PoolType2["PumpFunAmm"] = "PumpFunAmm";
  PoolType2["MeteoraDyn"] = "MeteoraDyn";
  PoolType2["MeteoraDynV2"] = "MeteoraDynV2";
  PoolType2["MeteoraDlmm"] = "MeteoraDlmm";
  return PoolType2;
})(PoolType || {});

// src/api.ts
var import_axios = __toESM(require("axios"));

// src/tier.ts
var SailfishTier = {
  is(value) {
    return SailfishTier.isFree(value) || SailfishTier.isBasic(value);
  },
  demo({ apiKey }) {
    return { type: "demo", apiKey: "demo" };
  },
  free({ apiKey }) {
    return { type: "free", apiKey };
  },
  basic({ apiKey }) {
    return { type: "basic", apiKey };
  },
  isDemo(value) {
    return _hasType(value) && value.type === "demo" && _hasApiKey(value);
  },
  isFree(value) {
    return _hasType(value) && value.type === "free" && _hasApiKey(value);
  },
  isBasic(value) {
    return _hasType(value) && value.type === "basic" && _hasApiKey(value);
  },
  isPolymarket(value) {
    return _hasType(value) && value.type === "polymarket" && _hasApiKey(value);
  },
  wsBaseUrl(tier) {
    let { baseUrl, authHeaders } = SailfishTier.httpBaseUrl(tier);
    if (SailfishTier.isDemo(tier)) {
      baseUrl = "wss://sailfish.0xfire.com/stream";
    }
    baseUrl = baseUrl.replace("https://", "wss://").replace("http://", "ws://");
    return { baseUrl, authHeaders };
  },
  httpBaseUrl(tier) {
    if (SailfishTier.isDemo(tier)) {
      return {
        baseUrl: "https://sailfish.0xfire.com",
        authHeaders: { "Authorization": tier.apiKey }
      };
    }
    if (SailfishTier.isFree(tier)) {
      return {
        baseUrl: "https://free.sailfish.solanavibestation.com",
        authHeaders: { "Authorization": tier.apiKey }
      };
    }
    if (SailfishTier.isBasic(tier)) {
      return {
        baseUrl: "https://basic.sailfish.solanavibestation.com",
        authHeaders: { "Authorization": tier.apiKey }
      };
    }
    if (SailfishTier.isPolymarket(tier)) {
      return {
        baseUrl: "https://polymarket-sailfish.0xfire.com",
        authHeaders: { "Authorization": tier.apiKey }
      };
    }
    const _exhaustiveCheck = tier;
    throw new Error(`Unsupported tier: ${JSON.stringify(tier)}`);
  }
};
function _hasType(value) {
  return _hasPropString(value, "type");
}
function _hasApiKey(value) {
  return _hasPropString(value, "apiKey");
}
function _hasPropString(value, prop) {
  return _hasPropStringOrUndefined(value, prop) && typeof value[prop] !== "undefined";
}
function _hasPropStringOrUndefined(value, prop) {
  if (typeof value !== "object") return false;
  if (value === null) return false;
  if (!(prop in value)) return false;
  const propValue = value[prop];
  if (typeof propValue === "undefined") {
  } else if (typeof propValue === "string") {
  } else {
    return false;
  }
  ;
  return true;
}

// src/api.ts
var SailfishApi = class {
  constructor({ tier }) {
    const { baseUrl, authHeaders } = SailfishTier.httpBaseUrl(tier);
    this.tier = tier;
    this.baseUrl = baseUrl;
    this.authHeaders = authHeaders;
  }
  async fetchLatestBlock() {
    return this.httpRequest("GET", "/tick");
  }
  async fetchPoolInfo(address) {
    return this.httpRequest("POST", "/sailfish/pools/query", address);
  }
  async fetchTokenInfo(address) {
    return this.httpRequest("POST", "/sailfish/tokens/query", address);
  }
  async fetchTrades(query) {
    return this.httpRequest("POST", "/sailfish/trades/query", query);
  }
  async fetchRawGraduations(query) {
    return this.httpRequest("POST", "/sailfish/graduated_pools_raw/query", query);
  }
  async httpRequest(method, path, data) {
    const response = await import_axios.default.request({
      method,
      url: this.baseUrl + path,
      data,
      headers: {
        "Content-Type": "application/json",
        ...this.authHeaders
      },
      timeout: 10 * 60 * 1e3
    });
    if (response.status !== 200) {
      throw new Error(`Failed to fetch latest block: ${response.statusText}`);
    }
    return response.data;
  }
};

// src/websocket.ts
var import_isomorphic_ws = __toESM(require("isomorphic-ws"));
var SailfishWebsocket = class {
  constructor({
    tier,
    botName,
    filter,
    callback
  }) {
    this.enabled = true;
    this.connecting = false;
    this.connected = false;
    this.socket = null;
    this.reconnectAttempts = 0;
    this.reconnecting = false;
    this.maxReconnects = 50;
    this.reconnectDelay = 1e3;
    const { baseUrl, authHeaders } = SailfishTier.wsBaseUrl(tier);
    this.tier = tier;
    this.baseUrl = baseUrl;
    this.authHeaders = authHeaders;
    this.botName = botName;
    this.filter = filter;
    this.callback = callback;
    this._start();
  }
  updateFilter(newFilter) {
    this.filter = newFilter;
    this.send({ type: "updateFilter", filter: newFilter });
  }
  _start() {
    if (!this.enabled || this.reconnecting) return;
    if (this.reconnectAttempts >= this.maxReconnects) {
      console.warn(`Max reconnect attempts reached for ${this.botName}`);
      return;
    }
    this.reconnectAttempts++;
    this.connecting = true;
    console.log(`Connecting to ${this.baseUrl} for ${this.botName}, attempt ${this.reconnectAttempts}`);
    const path = "/public/ws";
    const isBrowser = typeof window !== "undefined";
    if (isBrowser) {
      const params = new URLSearchParams(this.authHeaders).toString();
      this.socket = new import_isomorphic_ws.default(`${this.baseUrl}${path}?${params}`);
      console.warn("You are running this in a browser. You cannot auth via a browser because of websocket limitations. Please use Sailfish as a backend service.");
    } else {
      this.socket = new import_isomorphic_ws.default(this.baseUrl + path, {
        headers: { ...this.authHeaders }
      });
    }
    this.socket.addEventListener("open", this.onOpen.bind(this));
    this.socket.addEventListener("message", this.onMessage.bind(this));
    this.socket.addEventListener("close", this.onClose.bind(this));
    this.socket.addEventListener("error", this.onError.bind(this));
  }
  onOpen() {
    var _a;
    console.log(`Connected to ${this.baseUrl} for ${this.botName}`);
    this.connected = true;
    this.connecting = false;
    this.reconnecting = false;
    this.reconnectAttempts = 0;
    (_a = this.socket) == null ? void 0 : _a.send("Hello Server!");
    this.updateFilter(this.filter);
  }
  onMessage(event) {
    try {
      const data = JSON.parse(event.data);
      this.callback(data);
    } catch (err) {
      console.error(`Failed to parse message for ${this.botName}`, err);
    }
  }
  onClose(event) {
    console.warn(`Socket closed for ${this.botName}`, event);
    this.connected = false;
    this.connecting = false;
    this.scheduleReconnect();
  }
  onError(event) {
    var _a;
    console.error(`WebSocket error for ${this.botName}`, event);
    (_a = this.socket) == null ? void 0 : _a.close();
  }
  scheduleReconnect() {
    if (!this.enabled || this.reconnecting) return;
    this.reconnecting = true;
    setTimeout(() => {
      this.reconnecting = false;
      this._start();
    }, this.reconnectDelay);
  }
  stop() {
    var _a;
    this.enabled = false;
    this.connected = false;
    this.connecting = false;
    (_a = this.socket) == null ? void 0 : _a.close();
    this.socket = null;
  }
  send(data) {
    if (!this.socket || this.socket.readyState !== import_isomorphic_ws.default.OPEN) {
      console.warn(`Cannot send message; socket not open for ${this.botName}`);
      return;
    }
    const payload = typeof data === "string" ? data : JSON.stringify(data);
    this.socket.send(payload);
  }
};

// src/sailfish.ts
var DEFAULT_QUOTE_TOKEN_ADDRESSES = [
  "11111111111111111111111111111111",
  // SOL
  "So11111111111111111111111111111111111111112",
  // WSOL
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  // USDC
  "USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB"
  // USD1
];
var BONDING_CURVE_POOL_TYPES = [
  "PumpFunAmm" /* PumpFunAmm */,
  "RaydiumLaunchpad" /* RaydiumLaunchpad */
];
function amountToFloatString(amount, decimals) {
  if (amount === null || amount === void 0) {
    console.error("amountToFloatString received undefined/null amount");
    return "0";
  }
  const amountStr = String(amount);
  const padded = amountStr.padStart(decimals + 1, "0");
  const integerPart = padded.slice(0, padded.length - decimals) || "0";
  const fractionalPart = padded.slice(padded.length - decimals);
  return `${integerPart}.${fractionalPart}`;
}
function getTradeData(poolInfo, tradeRaw) {
  let quoteAmount = "0";
  let baseAmount = "0";
  let price = "0";
  if (poolInfo.quote_token.address.toLowerCase() === tradeRaw.token_address_in.toLowerCase()) {
    quoteAmount = `-${amountToFloatString(tradeRaw.token_amount_in, poolInfo.quote_token.decimals)}`;
    baseAmount = amountToFloatString(tradeRaw.token_amount_out, poolInfo.base_token.decimals);
  } else {
    quoteAmount = amountToFloatString(tradeRaw.token_amount_out, poolInfo.quote_token.decimals);
    baseAmount = `-${amountToFloatString(tradeRaw.token_amount_in, poolInfo.base_token.decimals)}`;
  }
  price = (Math.abs(parseFloat(quoteAmount)) / Math.abs(parseFloat(baseAmount))).toString();
  return {
    quote_amount: quoteAmount,
    base_amount: baseAmount,
    price
  };
}
function getQuoteAndBaseTokenInfos(token0Info, token1Info, supportedQuoteTokens = DEFAULT_QUOTE_TOKEN_ADDRESSES) {
  if (supportedQuoteTokens.includes(token0Info.address)) {
    return { quoteTokenInfo: token0Info, baseTokenInfo: token1Info };
  }
  if (supportedQuoteTokens.includes(token1Info.address)) {
    return { quoteTokenInfo: token1Info, baseTokenInfo: token0Info };
  }
  throw new Error(`No supported quote token found for ${token0Info.address} and ${token1Info.address}`);
}
var Sailfish = class {
  constructor({
    tier,
    filter,
    callbacks
  }) {
    this.tier = tier;
    this.filter = filter;
    this.callbacks = callbacks;
    this.api = new SailfishApi({ tier });
    this.ws = null;
    this.poolInfos = {};
    this.tokenInfos = {};
  }
  isRunning() {
    return this.ws !== null && this.ws.connected;
  }
  swim() {
    if (this.ws !== null) {
      return;
    }
    this.ws = new SailfishWebsocket({
      tier: this.tier,
      botName: "sailfish-ws",
      filter: this.filter,
      callback: (message) => {
        this.onMessage(message);
      }
    });
  }
  rest() {
    if (this.ws === null) {
      return;
    }
    this.ws.stop();
    this.ws = null;
  }
  onMessage(message) {
    switch (message.resource) {
      case "token-inits" /* TokenInits */:
        for (const tokenInit of message.data) {
          this.callbacks.onTokenInit(tokenInit);
        }
        break;
      case "token-mints" /* TokenMints */:
        for (const tokenMint of message.data) {
          this.callbacks.onTokenMint(tokenMint);
        }
        break;
      case "token-graduates" /* TokenGraduates */:
        for (const poolInit of message.data) {
          this.callbacks.onTokenGraduate(poolInit);
        }
        break;
      case "pool-inits" /* PoolInits */:
        for (const poolInit of message.data) {
          this.callbacks.onPoolInit(poolInit);
        }
        break;
      case "trades-raw" /* TradesRaw */:
        const tradesRaw = message.data;
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
  convertTradeRawToTrade(tradeRaw) {
    const poolInfo = this.getPoolInfo(tradeRaw.pool_address);
    if (poolInfo === null) {
      return null;
    }
    const tradeData = getTradeData(poolInfo, tradeRaw);
    const trade = {
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
      to_wallet_account: tradeRaw.to_account
    };
    return trade;
  }
  updateFilter(filter) {
    this.filter = filter;
    if (this.ws !== null) {
      this.ws.updateFilter(filter);
    }
  }
  hasCachedPoolInfo(poolAddress) {
    return this.poolInfos[poolAddress] !== void 0;
  }
  hasCachedTokenInfo(tokenAddress) {
    return this.tokenInfos[tokenAddress] !== void 0;
  }
  async fetchPoolInfo(poolAddress) {
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
  async fetchTokenInfo(tokenAddress) {
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
  insertPoolInfo(poolInfo) {
    this.poolInfos[poolInfo.address] = poolInfo;
  }
  async buildPoolInfoFromPoolInit(poolInit, supportedQuoteTokens = DEFAULT_QUOTE_TOKEN_ADDRESSES) {
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
  async buildPoolInfo(poolType, poolAddress, quoteTokenInfo, baseTokenInfo) {
    const poolInfo = {
      pool_type: poolType,
      address: poolAddress,
      quote_token: quoteTokenInfo,
      base_token: baseTokenInfo,
      buy_path: [
        quoteTokenInfo.address,
        baseTokenInfo.address
      ],
      sell_path: [
        baseTokenInfo.address,
        quoteTokenInfo.address
      ],
      token_0: quoteTokenInfo.address,
      token_1: baseTokenInfo.address
    };
    return poolInfo;
  }
  getPoolInfo(poolAddress) {
    var _a;
    return (_a = this.poolInfos[poolAddress]) != null ? _a : null;
  }
  getTokenInfo(tokenAddress) {
    var _a;
    return (_a = this.tokenInfos[tokenAddress]) != null ? _a : null;
  }
  getAllPools() {
    return this.poolInfos;
  }
  getAllTokens() {
    return this.tokenInfos;
  }
  getFilter() {
    return this.filter;
  }
};

// src/polymarket/types.ts
var PolymarketSailfishEventResource = /* @__PURE__ */ ((PolymarketSailfishEventResource2) => {
  PolymarketSailfishEventResource2["MarketOrdebooks"] = "market-ordebooks";
  return PolymarketSailfishEventResource2;
})(PolymarketSailfishEventResource || {});

// src/polymarket/sailfish.ts
var PolymarketSailfish = class {
  // market_slug -> orderbook
  constructor({
    filter,
    callbacks
  }) {
    this.filter = filter;
    this.callbacks = callbacks;
    this.ws = null;
    this.markets = {};
    this.orderbooks = {};
  }
  isRunning() {
    return this.ws !== null && this.ws.connected;
  }
  swim() {
    if (this.ws !== null) {
      return;
    }
    this.ws = new SailfishWebsocket({
      botName: "polymarket-ws",
      tier: { type: "polymarket", apiKey: "polymarket-api-key" },
      filter: this.filter,
      callback: (message) => {
        this.onMessage(message);
      }
    });
  }
  rest() {
    if (this.ws === null) {
      return;
    }
    this.ws.stop();
    this.ws = null;
  }
  onMessage(message) {
    switch (message.resource) {
      case "market-ordebooks" /* MarketOrdebooks */: {
        const data = message.data;
        this.orderbooks[data.market_slug] = data;
        if (this.markets[data.market_slug] === void 0) {
          this.markets[data.market_slug] = {
            market_slug: data.market_slug,
            question: data.question,
            token_0: data.token_0,
            token_1: data.token_1,
            last_update_time: data.last_update_time
          };
        }
        this.callbacks.onMarketOrdebooks(data);
        break;
      }
      default:
        this.callbacks.onMessage(message);
        break;
    }
  }
  getMarkets() {
    return this.markets;
  }
  getOrderbook(marketSlug) {
    var _a;
    return (_a = this.orderbooks[marketSlug]) != null ? _a : null;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BONDING_CURVE_POOL_TYPES,
  DEFAULT_QUOTE_TOKEN_ADDRESSES,
  PolymarketSailfish,
  PolymarketSailfishEventResource,
  PoolType,
  Sailfish,
  SailfishApi,
  SailfishEventResource,
  SailfishEventType,
  SailfishTier,
  SailfishWebsocket,
  amountToFloatString,
  getQuoteAndBaseTokenInfos,
  getTradeData
});
//# sourceMappingURL=index.js.map